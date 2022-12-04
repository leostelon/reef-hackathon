## VOYAGER INFRASTRUCTURE

_A realtime NFT search engine and analytics API on Reef⚡_

| Features |
| :------- |

- Search any NFT in Starknet, **_Params include_**
  - query (search with name, description, contract_address, token_id)
  - owner
  - limit
  - skip
  - createdAt (asc | desc)
  - chain_id (string, hex converted to number)(Used an default chain id of 8081, can be changed later)
- Analytics, get daily, weekly and monthly volume trade for NFTs
  - contract_address
  - start_date
  - end_date

| Available Endpoints |
| :------------------ |

**_NFT API_**

    curl --location -g --request GET '{{base_url}}/api/nfts?limit=10&chain_id=8080&query=&skip=0&owner=0x320CC5B64B609703cB3Da5c7744E0991FD6C0675'

[TRY IT](https://starknet.spriyo.xyz/api/nfts?limit=10&chain_id=&query=&skip=0&owner=)
**_ANALYTICS API_**

    curl --location -g --request GET '{{base_url}}/api/analytics?contract_address=0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c'

[TRY IT](https://starknet.spriyo.xyz/api/analytics?contract_address=0x03090623ea32d932ca1236595076b00702e7d860696faf300ca9eb13bfe0a78c)

| Use Cases⚡ |
| :---------- |

1.  Can be used in Explorers to track ERC721 and ERC1155 activity.
2.  Integration with NFT Marketplace. (https://sqwid.app currently doesn't index all the transactions, with our infrastructure it is possible to track every NFT in the Reef Chain)
3.  Can be used in In-Games which uses NFT

| How it works🤔 |
| :------------- |

- We regularly poll to the network and retrieve all the transactions
  for the current block.
- Filter out all the NFT based transaction, i.e. ERC721, ERC1155.
- We construct an NFT model, and store all the events to track the NFT activity.
- We also fetch the metadata url and the actual metadata for the NFT if it exist's. Images are stored in centralized server for faster retrievel.
- We index all these documents, with it's value atttached in each transaction, this will in turn be used for analytics purpose.

**⚠️🚨Server running on single thread CPU, so things might be slow🚨⚠️**

**Steps to run**

1.  Install Node.js v16.13.0
2.  Install MongoDB "version": "4.4.1"
3.  Clone this repo
4.  Create a folder named 'envconfig' in root directory
5.  Add a file .env with the below contents
    **PORT=3005
    ALLOWED_DOMAINS = "http://localhost:3001 http://localhost:3000 http://192.168.18.4:3000"
    MONGODB_URL=mongodb://localhost:27017/reef
    JWT_SECRET=secret
    AWS_ACCESS_KEY_ID=--AWS ACCESS Key--
    AWS_SECRET_ACCESS_KEY=--Bucket Access Key--
    AWS_BUCKET=--Bucket Name--
    ADMIN_PASS=adminpassword123
    CHAIN=REEF**
6.  Install all the package using 'npm i'
7.  Run the program by 'npm run dev'
