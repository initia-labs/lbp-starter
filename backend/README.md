# LBP Banckend Starter

Sample LBP API for showing historical and estimated prices during the LBP period.

## Requirements

- PostgreSQL
- Node.js

## Installation

### 1. Clone the repository and move to backend directory

```bash
git clone https://github.com/initia-labs/lbp-starter.git
cd lbp-starter/backend
```

### 2. Install dependencies

```bash
npm install
```

## Usage

### 1. Set config in .env

Create a `.env` file in the root directory and set the following environment variables:

> In LBP backend, we use `dotenv` for managing environment variable for development. See `.env_sample` for reference.

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| REST_URI             | REST URI for Initia L1                                                      |
| PAIR_METADATA        | Pair metadata                                                               |
| PAIR_CREATION_HEIGHT | Pair creation height                                                        |
| HEIGHT_INTERVAL      | Interval for storing pair balance in database                               |
| PORT                 | Port for API server (Default: 3000)                                         |                                                       
| DBHOST               | Database host                                                               |
| DBHOSTRO             | Database read-only host                                                     |
| DBPORT               | Database port                                                               |
| DBUSERNAME           | Database username                                                           |
| DBPASS               | Database password                                                           |
| DATABASE             | Database name                                                               |

For `PAIR_METADATA` and `PAIR_CREATION_HEIGHT`, you can get these values after creating the pair. 
You can check on Scan for the pair creation transaction and get the metadata and height from the `0x1::dex::CreatePairEvent`.
`liquidity_token` will be the `PAIR_METADATA` and block hegiht of the transaction will be the `PAIR_CREATION_HEIGHT`.

![Create LBP Pair](./image.png)

```bash
# example of .env
REST_URI=https://rest.testnet.initia.xyz
PAIR_METADATA= # Set after creating the pair
PAIR_CREATION_HEIGHT= # Set after creating the pair
HEIGHT_INTERVAL=100
PORT=3000

DBHOST=localhost
DBHOSTRO=localhost
DBPORT=5432
DBUSERNAME=postgres
DBPASS=
DATABASE=lbp
```

### 2. Create LBP Pair

```bash
npm run create-pair

> lbp-api@1.0.0 create-pair
> node --stack_size=1024 --max-old-space-size=1024 -r ts-node/register/transpile-only -r tsconfig-paths/register src/cli/createLbpPair.ts

Network Information
{
  "restUri": "https://rest.testnet.initia.xyz",
  "chainId": "initiation-2"
}

# Account you add the mnemonic for needs to have gas token on Initia L1 since it'll be used to create the pair
> Enter your bip39 mnemonic
wood syrup deposit ...

Key Information
{
  "bech32Address": "init1kamj4t6kgp4axj9xhmsts03tlkzrm7t423wc7g",
  "hexAddress": "0xb7772aaf56406bd348a6bee0b83e2bfd843df975",
  "publicKey": "AtkmYKzYzwLGZma5k0eCdlUF/TGP5MQkWrejiIDKAEQU",
  "balances": [
    {
      "denom": "uinit",
      "amount": "100000000"
    },
    {
      "denom": "utia",
      "amount": "100000000"
    }
  ]
}

> Enter coinA(denom or metadata)
uinit
> Enter coinB(denom or metadata)
utia
> Enter LBP start time in ISO string
2025-03-28T08:30:00Z
> Enter coinA start weight (0.5 == 50%)
0.01
> Enter LBP end time in ISO string
2025-03-28T09:00:00Z
> Enter coinA end weight (0.5 == 50%)
0.5
> Enter coinA amount (YOU CANNOT PROVIDE MORE COIN UNTIL LBP END)
50000000
> Enter coinB amount (YOU CANNOT PROVIDE MORE COIN UNTIL LBP END)
50000000
> Enter swap fee rate (0.003 == 0.3%)
0.003
> Enter pair name
test lbp
> Enter pair symbol
tlbp
TX:
{
  "body": {
    "memo": "",
    "messages": [
      {
        "@type": "/initia.move.v1.MsgExecute",
        "sender": "init1kamj4t6kgp4axj9xhmsts03tlkzrm7t423wc7g",
        "module_address": "0x1",
        "module_name": "dex",
        "function_name": "create_lbp_pair_script",
        "type_args": [],
        "args": [
          "CHRlc3QgbGJw",
          "BHRsYnA=",
          "BwCAU+57qAo=",
          "CF7mZwAAAAA=",
          "BwAAwW/yhiM=",
          "CAAAozfBL70N",
          "EGXmZwAAAAA=",
          "CAAAstNZW/AG",
          "CAAAstNZW/AG",
          "jkczvavPfUr8PRTw3UbJv1L7D86eS5lsk54ZW4vIkdk=",
          "rM6zskU5Kv4INGt5TPXE/4Xn6ajIL8r1ESrp1kulfMs=",
          "gPD6AgAAAAA=",
          "gPD6AgAAAAA="
        ]
      }
    ],
    "timeout_height": "0"
  },
  "auth_info": {
    "fee": {
      "amount": [
        {
          "denom": "uinit",
          "amount": "11093"
        }
      ],
      "gas_limit": "739483",
      "granter": "",
      "payer": ""
    },
    "signer_infos": [
      {
        "mode_info": {
          "single": {
            "mode": "SIGN_MODE_DIRECT"
          }
        },
        "public_key": {
          "@type": "/initia.crypto.v1beta1.ethsecp256k1.PubKey",
          "key": "AtkmYKzYzwLGZma5k0eCdlUF/TGP5MQkWrejiIDKAEQU"
        },
        "sequence": "0"
      }
    ]
  },
  "signatures": [
    "9DARiNalohMNIXsgGcN9gGQg8qbP/ClgLW3Pv+yMDhILtQRxDBAtNqthFLkJ41Oc4YSqZkUEF+sSiDt/9O2nUQ=="
  ]
}
> Do you want to broadcast TX? [y/n]
y
{
  height: 0,
  txhash: '9720DD1DB2A2E1A04C60110F54E20732190EB51535EA37E2543847596DE64354',
  raw_log: ''
}
```

### 3. Update Config with your pair

After creating the pair, update the `.env` file with the pair metadata and creation height. 

```bash
# .env
REST_URI=https://rest.testnet.initia.xyz   

# Update with your pair metadata
PAIR_METADATA=0x1389e8bfeb9978412866e946a212f27aaa167f60c1345d9499d9d174171079b9 
# Update with your pair creation height
PAIR_CREATION_HEIGHT=7089485 

HEIGHT_INTERVAL=100
PORT=3000

DBHOST=localhost
DBHOSTRO=localhost
DBPORT=5432
DBUSERNAME=postgres
DBPASS=
DATABASE=lbp
```

### 4. Run Indexer/API

```bash
npm start
```

## Endpoint

- `/prices?limit=100`

  - response type

    ```typescript
    export interface GetLbpPricesResponse {
      prices: LbpPrice[];
    }

    export interface LbpPrice {
      timestamp: Date;
      coin_a_price: number;
      coin_b_price: number;
    }
    ```
