## V2 related
DEPLOY_ENV?=local
PREVIEW_NAMESPACE?=""
ECR_REGISTRY?="584864542664.dkr.ecr.us-west-2.amazonaws.com"
ECR_REPOSITORY?=auth
IMAGE_TAG?=latest
K8S_ROOT=deploy/k8s
K8S_SPEC=$(K8S_ROOT)/tmp
HELM_ROOT=$(K8S_ROOT)/helm
HELM_ENVS=$(HELM_ROOT)/environments
HELM_DST=$(K8S_SPEC)/$(ECR_REPOSITORY)/app/templates
HELM_CHART=$(shell cat $(HELM_ENVS)/$(ECR_REPOSITORY)/chart_path)

.PHONY: docker-test
docker-test:
	docker build -t ftmt-tester -f deploy/Dockerfile --target=tester .

.PHONY: docker-build
docker-build:
	docker build -t $(ECR_REGISTRY)/$(ECR_REPOSITORY):$(IMAGE_TAG) -f deploy/Dockerfile --target=runner-local .

.PHONY: docker-local
docker-local:
	NPM_TOKEN=$(NPM_TOKEN) API_KEY=$(API_KEY) local/local.sh

## K8s
.PHONY: clean-manifests
clean-manifests:
	rm -rf $(K8S_SPEC)/

.PHONY: helm-template
helm-template: clean-manifests
	helm template \
		--values $(HELM_ENVS)/$(ECR_REPOSITORY)/$(DEPLOY_ENV)/values.yaml  \
		--set deployEnv=${DEPLOY_ENV} \
		--set previewNamespace=$(PREVIEW_NAMESPACE) \
		--set deployment.appContainer.image=$(ECR_REGISTRY)/$(ECR_REPOSITORY) \
		--set deployment.appContainer.tag=$(IMAGE_TAG) \
		--set settings.new_cluster=$(NEW_CLUSTER) \
		--output-dir $(K8S_SPEC)/$(ECR_REPOSITORY) \
		$(HELM_CHART)

## Remote K8s
.PHONY: k8s-diff
k8s-diff:
	@# kubectl diff exist codes: 0 - no diff, 1 - there is a diff, 2 - something is wrong
	@# Since exit code 1 is failure, make will always fail if there is a diff, so code modification required
	@kubectl diff -f $(HELM_DST) || (st=$$?; if [ $$st = 1 ]; then exit 0; else echo $$st; exit $$st; fi)

.PHONY: k8s-deploy
k8s-deploy:
	kubectl apply -f $(HELM_DST)
	@if [ -f "$(HELM_DST)/deployment.yaml" ]; then \
		echo "kubectl rollout status -f $(HELM_DST)/deployment.yaml --timeout=600s"; \
		kubectl rollout status -f $(HELM_DST)/deployment.yaml --timeout=600s; \
	fi
