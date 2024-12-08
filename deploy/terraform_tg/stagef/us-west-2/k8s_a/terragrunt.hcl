include "root" {
  path   = find_in_parent_folders()
  expose = true
}

include "root_k8s" {
  path = find_in_parent_folders("k8s.hcl")
}

inputs = {
  iam_role = {
    name = "eks-auth-${include.root.locals.deploy_env}"
    arn  = "arn:aws:iam::211163739222:role/eks-auth-${include.root.locals.deploy_env}"
  }
}
