import helmet, { HelmetCspDirectiveValue } from 'helmet';
import { decodeBase64, parseJWT } from '~/server/libs/base64';
import { composeMiddleware } from './compose-middleware';
import { handler } from './handler-factory';
import { GET_CREDENTIALS_PROXY_URL, IS_DEPLOY_ENV_PROD } from '~/shared/constants/env';
import { ClientEndpoint } from '~/server/routes/client/client.endpoint';
import { serverLogger } from '~/server/libs/datadog';
import { getCSPResource } from '~/features/oauth/controllers/server/csp';

export const allowIframe = handler((req, res, next) => {
  res.removeHeader('x-frame-options');
  next();
});

export const disallowIframe = handler((req, res, next) => {
  res.set('x-frame-options', 'DENY');
  next();
});

export const defaultCSP: helmet.IHelmetContentSecurityPolicyDirectives = {
  defaultSrc: ["'self'"],

  styleSrc: [
    "'self'",
    (req, res) => `'nonce-${res.ext.nonce}'`,
    'https://*.magic.link/',
    'https://*.google.com/',
    'https://*.paypal.com/',
    "'sha256-9h9aPS509wv9tZVxhu0nafBWlh+iaLnprlcvGgGBrdc='", // wallet connect
    "'sha256-qGb7vgSAbYQs1UHdHR0mkAWZOWq0gWCujIRzNZyaOBA='", // coinbase wallet
    "'sha256-/Y8sOmVZLE8kYkmzpX15FodnMH6ygvqAz1FyNpY8qoo='", // coinbase wallet
    "'sha256-thB/1uQ6hZv+vTQDSxOw21131dHhE475xakO9wp4pxo='", // coinbase wallet
    "'sha256-RDyX84FsgOvLbAZGMVQEW44ekaoNNGW02EBlsWpccqE='", // coinbase wallet
    "'sha256-lmto2U1o7YINyHPg9TOCjIt+o5pSFNU/T2oLxDPF+uw='", // google one-tap
    "'sha256-iQlKQ9NMfKFe1bhenBQcX7URGOf6runbFUaxGbT2Wq4='", // google one-tap
    "'sha256-O2Z/Int2dnWQI+JpBc4hIRlC7oBedig41hu/v71CM38='", // paypal
    "'sha256-OD2qCYSMgpjUPwfJ9xiXPII1q/+4RP3w9GtIIA3KT4c='", // paypal
    "'sha256-P/Vl/NGfWvgIPKFGKI3fn2It9oZp0DKbLqJf4mD4eYs='", // paypal
    "'sha256-bDP03xea1iCceInRdh/9TemybO0QuYI9qxxXSAlUUNg='", // paypal
    "'sha256-pSnTSH3+KHlOUSg99xj/Lxau+uDwO4XDkaU7Bmgriq4='", // paypal
    "'sha256-qoibMNjIQWq/LPsqu1GRBPZYGKGqw/4ggLU51LMmCFo='", // paypal
    "'sha256-+W1kP7MnoEBAVMH1OMmL6R4z0JlMf/brhyn+5FTOG60='", // emotion
    "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // nft collectibles
  ],
  frameSrc: [
    "'self'",
    'https://*.magic.link/',
    'https://accounts.google.com/',
    'https://*.launchdarkly.com/',
    'https://buy.onramper.com',
    'https://onramper.tech',
    'https://www.google.com/',
    'https://crypto.sandbox.sardine.ai',
    'https://crypto.sardine.ai',
    'https://demo-onboarding.incodesmile.com', // Used by Sardine for KYC (sandbox)
    'https://saas-onboarding.incodesmile.com', // Used by Sardine for KYC (live)
    'https://assets.braintreegateway.com',
    'https://*.paypal.com',
    'https://vercel.live/',
  ],

  imgSrc: [
    "'self'",
    'data:',
    'https://*.fortmatic.com/',
    'https://*.magic.link/',
    'https://www.google-analytics.com/',
    'https://flagcdn.com', // ISO flag icons
    'https://s3.amazonaws.com/uploads.uservoice.com/', // [ch29084]
    'https://*.fairmint.co/', // [ch41276]
    'https://fairmint.co/', // [ch41276]
    'https://chainstarters-cdn.test-cross-last.chainstarters.io/', // ChainStarters
    'https://imagedelivery.net', // Wallet Connect
    'https://lh3.googleusercontent.com/', // Google Social login profile picture
    'https://registry.walletconnect.com/',
    'https://i.seadn.io/', // OpenSea NFTs
    'https://*.graphassets.com/', // Graphassets NFTs with ipfs data
    'https://*.pinata.cloud/', // Pinata NFTs with ipfs data
    'https://*.mypinata.cloud/', // Pinata NFTs with ipfs data
    'https://*.alchemy.com/',
    'https://*.ipfs.nftstorage.io/',
    'https://ipfs.io/', // NFTs with ipfs data
    'https://*.raribleuserdata.com/', // Rarible / Mattel NFTs
    'https://*.paypal.com/', // Paypal
    'https://www.paypalobjects.com/', // Paypal
    'https://static.alchemyapi.io/', // Alchemy
    'https://res.cloudinary.com/', // Cloudinary Alchemy API
    'https://*.veefriends.com/', // VeeFriends
    'https://*.ipfs.dweb.link/', // IPFS
    /**
     * [ch30061]
     *
     * For multi-tenanted partners like UserVoice, the custom logo (part of
     * custom theming) base domain may not be statically known. For these
     * edge cases, we include the `asset_uri` field from the encoded custom
     * theme in the CSP directive.
     */
    (req, res) => {
      const fallback = ''; // purposely empty string

      try {
        if (req.query?.ct) {
          return JSON.parse(decodeBase64(req.query?.ct as string))?.asset_uri ?? fallback;
        }
        if (req.query?.token) {
          return parseJWT(req.query.token as string)?.payload?.style?.asset_uri ?? fallback;
        }
      } catch {}

      return fallback;
    },
  ],

  fontSrc: ["'self'", 'https://*.magic.link/', 'https://fonts.gstatic.com/'],

  connectSrc: [
    /* Magic */
    "'self'",
    'https://*.magic.link/',
    'https://*.fortmatic.com/',

    /* Eth */
    'https://*.alchemyapi.io/',
    'wss://*.ws.alchemyapi.io/',
    'https://*.infura.io/',
    'https://*.alchemy.com/',
    'https://*.quiknode.pro/',
    'https://*.maticvigil.com/',
    'https://*.binance.org/',
    'https://*.moralis.io/',
    'https://*.matic.network/',
    'https://*.polygon.technology',
    'https://*.binance.org:8545/',
    'https://rpc2.sepolia.org/',

    /* Services */
    `${GET_CREDENTIALS_PROXY_URL.replace(/\/$/, '')}/`,
    'https://cognito.us-west-2.amazonaws.com/',
    'https://kms.us-west-2.amazonaws.com/',
    'https://cognito-identity.us-west-2.amazonaws.com/',
    'https://*.google.com/',
    'https://www.google-analytics.com/',
    'https://us-east-1.hightouch-events.com/',
    'https://api.amplitude.com/',
    'https://*.datadoghq.com/',
    'https://browser-intake-datadoghq.com/',
    'wss://*.peerjs.com',
    'https://*.launchdarkly.com/',
    'wss://*.bridge.walletconnect.org',
    'https://registry.walletconnect.com/',
    'wss://www.walletlink.org/rpc',
    'https://*.hightouch-events.com/',

    /* Partners */
    'https://node1.fairmint.co/',
    'https://beefledgerwallet.com:8544/',
    'https://core.bloxberg.org/',
    'https://node.moonnet.space/', // [ch19879]
    'https://rpc.xdaichain.com/', // [ch32162]
    'https://matic-mumbai.chainstacklabs.com/', // [ch47896]
    'https://sokol.arianee.net/', // Arianee

    /* Astar */
    'https://evm.astar.network/', // [SC-86006]
    'wss://rpc.astar.network',
    'https://rpc.startale.com/', // PDEPLA-168]

    /* Decentraland */
    'https://rpc.decentraland.org', // [SC-76141]

    /* EBay */
    'https://*.knownoriginlabs.io', // [SC-80180]

    /* Third Web */
    'https://*.rpc.thirdweb.com/', // [sc67162]

    /* SportX */
    'https://rpc.toronto.sx.technology', // [ch44139]
    'https://rpc.sx.technology',

    /* Snowball */
    'https://apis.ankr.com/', // [ch41217]
    'https://bsc.getblock.io/',

    /* Splunk */
    'https://rpc.ankr.com/', // [sc52429]

    /* Horizen EON */
    'https://gobi-rpc.horizenlabs.io', // [PDEEXP-979]
    'https://eon-rpc.horizenlabs.io',

    /* Flare Network */
    'https://coston-api.flare.network', // [PDEEXP-903]
    'https://flare-api.flare.network',

    /* Opolis */
    'https://*.pokt.network/',

    /* Tokenism (Rebranded to Arku) */
    'https://dblockchain.akru.co', // [ch39728]
    'https://blockchain.akru.co',
    'https://avax.getblock.io/',

    /* Local Node */
    'http://localhost:*/',
    'http://127.0.0.1:*/',
    'ws://127.0.0.1:*/',

    // --- Multi-Blockchain

    /* Berachain */
    'https://artio.rpc.berachain.com/', // [PDEPLA-167]

    /* Base */
    'https://mainnet.base.org/', // [sc83791]
    'https://goerli.base.org/', // [sc72304]

    /* Cronos */
    'https://evm.cronos.org/', // [sc52466]
    'https://evm-t3.cronos.org/',

    /* Flow */
    'https://*.onflow.org',

    /* Fragmynt */
    'https://rpc.fragmynt.network/', // [sc53736]
    'https://galway-rpc.fragmynt.network/',

    /* ICON */
    'https://lisbon.net.solidwallet.io/',
    'https://ctz.solidwallet.io/',
    'https://berlin.net.solidwallet.io/',

    /* Harmony */
    'https://api.harmony.one/',
    'https://api.s0.t.hmny.io/',
    'https://api.s0.b.hmny.io/',

    /* Tezos */
    'https://tezos-prod.cryptonomic-infra.tech/',
    'https://tezos-dev.cryptonomic-infra.tech/',
    'https://mainnet.api.tez.ie',
    'https://hangzhounet.api.tez.ie', // hangzhounet testnet
    'https://ithacanet.ecadinfra.com', // ithacanet testnet
    'https://ghostnet.tezos.marigold.dev',

    /* Polkadot */
    'wss://rpc.polkadot.io',
    'wss://kusama-rpc.polkadot.io/',
    'wss://rococo-rpc.polkadot.io/',
    'wss://westend-rpc.polkadot.io',

    /* Poa */
    'https://sokol.poa.network/', // [ch24181]
    'https://xdai.poanetwork.dev/', // [ch24190]

    /* Skale */
    'https://*.skalelabs.com', // [ch33614]
    'https://*.skale.network',
    'https://*.skalenodes.com',

    /* Etherlink */
    'https://node.ghostnet.etherlink.com', // [PDEPLA-168]

    /* Matic */
    'https://*.matic.today/', // [ch22520]
    'https://polygon-rpc.com/', // [ch44102],
    'https://public.stackup.sh/api/v1/node/polygon-mumbai',

    /* cosmos */
    'https://rpc.sentry-01.theta-testnet.polypore.xyz',

    /* Polygon zkEVM */
    'https://zkevm-rpc.com/', // [sc-75187]
    'https://rpc.public.zkevm-test.net/', // [sc-75187]

    /* RARI chain */
    'https://testnet.rpc.rarichain.org', // [PDEPLA-46]
    'https://mainnet.rpc.rarichain.org',

    /* Solana */
    'https://api.mainnet-beta.solana.com',
    'https://devnet.solana.com',
    'https://api.devnet.solana.com', // [ch48171]
    'https://testnet.solana.com', // [ch23098]
    'https://api.testnet.solana.com',

    /* zilliqa */
    'https://api.zilliqa.com/',
    'https://dev-api.zilliqa.com/',

    /* Avalanche */
    'https://api.avax.network/',
    'https://api.avax-test.network/', // [ch39961]
    'https://testapi.avax.network',

    /* xDAI */
    'https://dai.poa.network/', // [ch36504]
    'https://rpc.gnosischain.com',
    'https://xdai.1hive.org/',

    /* Optimism */
    'https://*.optimism.io', // [ch38949]

    /* Celo */
    'https://alfajores-forno.celo-testnet.org',
    'https://forno.celo.org', // [ch42316]

    /* Binance Smart Chain */
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',

    /* Moonbeam */
    'https://*.moonbeam.network',

    /* Fantom */
    'https://rpcapi.fantom.network', // [ch40353]
    'https://rpc.testnet.fantom.network/', // Testnet
    'https://rpc.ftm.tools/', // Mainnet

    /* Arbitrum - List of Public Chains https://developer.offchainlabs.com/public-chains */
    'https://*.arbitrum.io/', // [SC61807]
    'https://arb1.arbitrum.io/rpc',
    'https://sepolia-rollup.arbitrum.io/rpc',

    /* Conflux */
    'https://test.confluxrpc.com',
    'https://main.confluxrpc.com',

    /* zkSync */
    'https://stage2-api.zksync.dev/',

    /* zkSync Era */
    'https://mainnet.era.zksync.io', // mainnet [sc-74931]
    'wss://mainnet.era.zksync.io',
    'https://testnet.era.zksync.dev', // testnet
    'wss://testnet.era.zksync.dev',
    'https://sepolia.era.zksync.dev', // testnet

    /* Telos */
    'https://*.telos.net/',

    /* Aurora */
    'https://*.aurora.dev',

    /* Metis */
    'https://*.metis.io',

    /* Velas */
    'https://evmexplorer.velas.com/', // [SC49677]
    'https://evmexplorer.testnet.velas.com/',
    'https://evmexplorer.devnet.velas.com/',

    /* ICE */
    'https://arctic-rpc.icenetwork.io:9933',
    'wss://arctic-rpc.icenetwork.io:9944',

    /* Public MINT */
    'https://rpc.tst.publicmint.io:8545',
    'https://rpc.publicmint.io:8545',

    /* OKEx */
    'https://exchainrpc.okex.org/', // [SC53244]

    /* Chainstack */
    'https://*.p2pify.com/', // [SC53244]

    /* Hdera node */
    'https://*.myhbarwallet.com',

    /* Wanchain */
    'https://gwan-ssl.wandevs.org:56891/', // [sc65512]

    /* Aptos */
    'https://fullnode.mainnet.aptoslabs.com', // [sc79013]
    'https://fullnode.testnet.aptoslabs.com',
    'https://fullnode.devnet.aptoslabs.com',

    /* Paypal */
    'https://www.paypal.com',
    'https://www.sandbox.paypal.com',

    /* Hedera */
    'https://*.hedera.com/',
    'https://*.swirldslabs.com/',
    'https://*.swirlds.com',

    /* Zeta */
    'https://*.zetachain.com',
    'https://*.blockpi.network',
    'https://zetachain-rpc.lavenderfive.com/',
    'https://zetachain-mainnet-archive.allthatnode.com:*',
    'wss://zetachain-mainnet-archive.allthatnode.com:*',

    /* Chiliz */
    'https://rpc.ankr.com/chiliz',
    'https://spicy-rpc.chiliz.com',

    /* Poa */
    'https://core.poa.network',
    'https://sokol.arianee.net',

    /* Stability */
    'https://alphanet.stble.io',
    'https://magic.free.testnet.stabilityprotocol.com',
    'https://*.stabilityprotocol.com',

    /* BASE */
    'https://mainnet.base.org',
    'https://goerli.base.org',
    'https://sepolia.base.org',
  ],

  scriptSrc: [
    "'self'",
    (req, res) => `'nonce-${res.ext.nonce}'`,
    "'unsafe-eval'",
    "'report-sample'",
    'https://*.magic.link/',
    'https://cdn.amplitude.com/',
    'https://www.google-analytics.com/analytics.js',
    'https://accounts.google.com/gsi/client',
    'https://*.launchdarkly.com/',
    'https://www.google.com/',
    'https://*.paypal.com/',
    'https://www.paypalobjects.com/',
    "'sha256-O2Z/Int2dnWQI+JpBc4hIRlC7oBedig41hu/v71CM38='", // paypal
  ],

  workerSrc: ['blob:'],

  baseUri: ["'self'"],

  objectSrc: ["'none'"],
};

export const security = composeMiddleware(
  handler(async (req, res, next) => {
    res.set('strict-transport-security', 'max-age=63072000; includeSubdomains; preload');
    res.set('x-content-type-options', 'nosniff');
    res.set('x-xss-protection', '1; mode=block');
    res.set('referrer-policy', 'strict-origin-when-cross-origin');

    // enable CORP to unblock Ondefy
    // Note, this response header will disable all CDN libraries without CORP enabled.
    if (req.path === ClientEndpoint.SendV1 || req.path === ClientEndpoint.SendLegacy) {
      try {
        const paramObj = JSON.parse(decodeBase64(req.query?.params as string));

        if (paramObj.API_KEY === 'pk_live_25D2689CB5394A15') {
          res.set('cross-origin-resource-policy', 'cross-origin');
        }
      } catch (e) {
        serverLogger.error('CORP set failed', { error: e });
      }
    }

    next();
  }),
  handler(async (req, res, next) => {
    const connectSrcDeepCopy = JSON.parse(JSON.stringify(defaultCSP.connectSrc));
    // Get the self-server CSP and concat to the default CSP
    try {
      if (req.path === ClientEndpoint.SendV1 || req.path === ClientEndpoint.SendLegacy) {
        const paramObj = JSON.parse(decodeBase64(req.query?.params as string));

        const cspResource = (await getCSPResource(paramObj.API_KEY, req)).data;
        const clientCsp = cspResource.map(cspSource =>
          cspSource.is_active && cspSource.type === 'connect-src' ? cspSource.value : undefined,
        );
        connectSrcDeepCopy?.push(...clientCsp);
      }
    } catch (e) {
      serverLogger.error('CSP Error', { error: e });
    }

    const helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: { ...defaultCSP, connectSrc: connectSrcDeepCopy as HelmetCspDirectiveValue[] },
      },
      dnsPrefetchControl: false,
      frameguard: false,
      xssFilter: false,
      ieNoOpen: false,
      noSniff: true, // Contact #security before making any changes
      hsts: false, // Enforced at network edge in Cloudflare, safe to leave off
    });

    helmetMiddleware(req, res, next);
  }),
);
