import BigNumber from 'bignumber.js';
import { Router } from 'express';
import multer from 'multer';

import { UPLOAD_FILESIZE_MAX } from "../constant"
import { getIPFSHash, uploadFilesToIPFS } from '../ipfs';
import { queryLIKETransactionInfo } from '../like';
import { registerNUMAssets } from '../numbers-protocol';
import { timeout, checkFileValid, convertMulterFiles } from '../utils';

import { estimateARPrices, convertARPricesToLIKE, uploadFilesToArweave } from '.';

const { LIKE_TARGET_ADDRESS } = require('../config/config');

const router = Router();

router.post(
  '/estimate',
  multer({ limits: { fileSize: UPLOAD_FILESIZE_MAX } }).any(),
  checkFileValid,
  async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    const arFiles = convertMulterFiles(files);
    const [
      ipfsHash,
      prices,
    ] = await Promise.all([
      getIPFSHash(arFiles),
      estimateARPrices(arFiles),
    ]);
    const pricesWithLIKE = await convertARPricesToLIKE(prices);
    res.json({
      ...pricesWithLIKE,
      ipfsHash,
      memo: JSON.stringify({ ipfs: ipfsHash}),
      address: LIKE_TARGET_ADDRESS,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload',
  multer({ limits: { fileSize: UPLOAD_FILESIZE_MAX } }).any(),
  checkFileValid,
  async (req, res, next) => {
  try {
    const shouldRegisterNUMAssets = req.body.num && req.body.num !== '0';
    const files = req.files as Express.Multer.File[];
    console.log('point 0')
    const arFiles = convertMulterFiles(files);
    console.log('point 1')
    const [
      ipfsHash,
      prices,
    ] = await Promise.all([
      getIPFSHash(arFiles),
      estimateARPrices(arFiles),
    ]);
    console.log('point 2')
    const { arweaveId: existingArweaveId } = prices;

    // shortcut for existing file without checking tx
    if (existingArweaveId) {
      let numAssetsIds = [];
      if (shouldRegisterNUMAssets) {
        numAssetsIds = await registerNUMAssets(arFiles.map(file => ({
          file: file.buffer,
          filename: file.filename,
        })))
      }
      res.json({
        arweaveId: existingArweaveId,
        ipfsHash,
        numAssetsIds,
      })
      return;
    }
    console.log('point 3')
    const { txHash } = req.query;
    if (!txHash) {
      res.status(400).send('MISSING_TX_HASH');
      return
    }
    let tx;
    let tryTimes = 0;
    do {
      tryTimes += 1
      /* eslint-disable no-await-in-loop */
      console.log('tryTimes',tryTimes)
      tx = await queryLIKETransactionInfo(txHash as string, LIKE_TARGET_ADDRESS);
      if (!tx && tryTimes < 100) await timeout(2000);
      /* eslint-enable no-await-in-loop */
    } while (!tx && tryTimes < 100)
    console.log('point 4')

    if (!tx || !tx?.amount) {
      res.status(400).send('TX_NOT_FOUND');
      return;
    }
    console.log('point 5')
    const { memo, amount } = tx;
    let memoIPFS = '';
    try {
      ({ ipfs: memoIPFS } = JSON.parse(memo));
    } catch (err) {
      // ignore non-JSON memo
    console.log('point 6')
    }
    console.log('point 7')

    if (!memoIPFS || memoIPFS !== ipfsHash) {
    console.log('point 8')

      res.status(400).send('TX_MEMO_NOT_MATCH');
      return;
    }
    console.log('point 9')

    const { LIKE } = await convertARPricesToLIKE(prices, { margin: 0.03 });
    console.log('point 10')

    const txAmount = new BigNumber(amount.amount).shiftedBy(-9);
    console.log('point 11')

    if (txAmount.lt(LIKE)) {
    console.log('point 12')

      res.status(400).send('TX_AMOUNT_NOT_ENOUGH');
      return;
    }
    console.log('point 13')

    const promises: Promise<any>[] = [
      uploadFilesToArweave(arFiles),
      uploadFilesToIPFS(arFiles),
    ];
    console.log('point 14')

    if (shouldRegisterNUMAssets) {
      promises.push(registerNUMAssets(arFiles.map(file => ({
        file: file.buffer,
        filename: file.filename,
      }))))
    }
    console.log('point 15')

    const [
      {
        arweaveId,
        list,
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _,
      numAssetIds,
    ] = await Promise.all(promises)
    console.log('point 16')

    res.json({ arweaveId, ipfsHash, list, numAssetIds: numAssetIds || [] });
  } catch (error) {
    next(error);
  }
});

export default router;
