import { Account } from "@solana/spl-token";
import {
	Connection,
	Keypair,
	PublicKey,
	TransactionInstruction,
	VersionedTransaction,
	TransactionMessage,
	AccountInfo,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export function loadKeypairFromFile(path: string): Keypair {
	return Keypair.fromSecretKey(
		Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8"))),
	);
}

export function newLogSection() {
	console.log("-----------------------------------------------------");
}

export async function logAccountInfo(accountInfo: AccountInfo<Buffer> | null) {
	console.log("Account Info:");
	console.log(accountInfo);
}

export function logNewKeypair(keypair: Keypair) {
	console.log("Created a new keypair.");
	console.log(`   New account Public Key: ${keypair.publicKey}`);
}

export async function logTransaction(
	connection: Connection,
	signature: string,
) {
	const signatureStatus = await connection.getSignatureStatus(signature);// 检查交易状态
	if (signatureStatus.value?.confirmationStatus === 'confirmed' || signatureStatus.value?.confirmationStatus === 'finalized') { //有两种状态代表完成
		console.log('Transaction confirmed!');
	} else if (signatureStatus.value?.err) {// 交易失败
		console.error('Transaction failed:', signatureStatus.value.err);
	}	else {
		console.log('Transaction not yet confirmed.');
	}
	console.log(`   Transaction signature: ${signature}`);//signature是交易的txHash
}

export async function logBalance(
	accountName: string,
	connection: Connection,
	pubkey: PublicKey,
) {
	const balance = await connection.getBalance(pubkey);
	console.log(`   ${accountName}:`);
	console.log(`       Account Pubkey: ${pubkey.toString()} SOL`);
	console.log(`       Account Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
}

export function logNewMint(mintPubkey: PublicKey, decimals: number) {
	console.log("Created a new mint.");
	console.log(`   New mint Public Key: ${mintPubkey}`);
	console.log(`   Mint type: ${decimals === 0 ? "NFT" : "SPL Token"}`);
}

export async function buildTransaction(
	connection: Connection,
	payer: PublicKey,
	signers: Keypair[],
	instructions: TransactionInstruction[],
): Promise<VersionedTransaction> {
	let blockhash = await connection
		.getLatestBlockhash()
		.then((res) => res.blockhash);

	const messageV0 = new TransactionMessage({
		payerKey: payer,
		recentBlockhash: blockhash,
		instructions,
	}).compileToV0Message();

	const tx = new VersionedTransaction(messageV0);

	signers.forEach((s) => tx.sign([s]));

	return tx;
}
