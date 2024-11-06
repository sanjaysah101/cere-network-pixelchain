'use server';

import {
  DdcClient,
  TESTNET,
  File,
  AuthTokenOperation,
  ClusterId,
} from '@cere-ddc-sdk/ddc-client';

// Replace with your actual seed phrase from Cere Network
const SEED_PHRASE = process.env.CERE_SEED_PHRASE || '';
const CLUSTER_ID = process.env.CERE_CLUSTER_ID || '';

export async function uploadToDdc(fileBuffer: Buffer) {
  try {
    // Initialize DDC client
    const ddcClient = await DdcClient.create(SEED_PHRASE, TESTNET);

    // Create a bucket (or use existing one)
    const bucketId = await ddcClient.createBucket(CLUSTER_ID as ClusterId);

    // Create a File instance from the buffer
    const file = new File([fileBuffer], {
      size: fileBuffer.length,
    });

    // Upload to DDC
    const { cid: fileCid } = await ddcClient.store(bucketId, file);

    // Generate access token for private bucket
    const accessToken = await ddcClient.grantAccess(CLUSTER_ID, {
      bucketId,
      pieceCid: fileCid,
      operations: [AuthTokenOperation.GET],
    });

    // Return the file URL
    return {
      url: `https://cdn.testnet.cere.network/${bucketId}/${fileCid}?token=${accessToken}`,
      cid: fileCid,
      bucketId,
    };
  } catch (error) {
    console.error('DDC upload error:', error);
    throw new Error('Failed to upload file to DDC');
  }
}
