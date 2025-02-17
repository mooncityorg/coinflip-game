# CoinFlip (Solana)

#### Demo
https://sol-coinflip.vercel.app/
-> Runs in devnet
Run
### Provable Coin Flip Program on Solana.
The app consists of a vendor and a player. 
1. Player triggers a coin flip game by selecting side and the amount of SOL to bet. 
2. Vendor creates a CoinFlip game on-chain and saves the bet of the user and sends the equal amount of SOL to CoinFlip PDA. In this step, vendor generates a random seed to be used in the coin flip.
3. When the CoinFlip account is created, user generates a random seed and sends approves the Play transaction by sending the bet amount to CoinFlip PDA.
4. Play function will combine the vendor hash, player hash and the current timestamp to flip the coin. This way, not a single participant can influence the result as the seeds are aggregated from different sources.
5. CoinFlip account sends the amount to the winner, logs the events and closes the account.


#### Webapp
Webapp is generated using Next.js and [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter#readme).

#### Running the app
1. Start the local Solana validator
2. Deploy the app to local cluster with `anchor deploy`
3. Go to the `app` directory and run `npm run install`
4. Run the app with `VENDOR_SECRET_KEY` env variable. You can use any keypair as the vendor. Example: `VENDOR_SECRET_KEY=[12, 232,1231 ...] npm run dev`
