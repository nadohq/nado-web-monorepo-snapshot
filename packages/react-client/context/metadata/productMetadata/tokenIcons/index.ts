import type { ImageSrc } from '../../../../types/ImageSrc';
import aaplIcon from './aapl.svg';
import aaveIcon from './aave.svg';
import amznIcon from './amzn.svg';
import asterIcon from './aster.svg';
import avaxIcon from './avax.svg';
import bchIcon from './bch.svg';
import bnbIcon from './bnb.svg';
import bonkIcon from './bonk.svg';
import btcIcon from './btc.svg';
import dogeIcon from './doge.svg';
import enaIcon from './ena.svg';
import ethIcon from './eth.svg';
import eurusdIcon from './eurusd.svg';
import fartcoinIcon from './fartcoin.svg';
import gbpusdIcon from './gbpusd.svg';
import googIcon from './goog.svg';
import hypeIcon from './hype.svg';
import jupIcon from './jup.svg';
import kbtcIcon from './kbtc.svg';
import linkIcon from './link.svg';
import litIcon from './lit.svg';
import ltcIcon from './ltc.svg';
import metaIcon from './meta.svg';
import monIcon from './mon.svg';
import msftIcon from './msft.svg';
import nlpIcon from './nlp.svg';
import nvdaIcon from './nvda.svg';
import oilIcon from './oil.svg';
import ondoIcon from './ondo.svg';
import penguIcon from './pengu.svg';
import pepeIcon from './pepe.svg';
import pumpIcon from './pump.svg';
import qqqIcon from './qqq.svg';
import silverIcon from './silver.svg';
import skrIcon from './skr.svg';
import solIcon from './sol.svg';
import spyIcon from './spy.svg';
import suiIcon from './sui.svg';
import taoIcon from './tao.svg';
import tslaIcon from './tsla.svg';
import uniIcon from './uni.svg';
import usdcIcon from './usdc.svg';
import usdjpyIcon from './usdjpy.svg';
import usdt0Icon from './usdt0.svg';
import uselessIcon from './useless.svg';
import wethIcon from './weth.svg';
import wlfiIcon from './wlfi.svg';
import xautIcon from './xaut.svg';
import xmrIcon from './xmr.svg';
import xplIcon from './xpl.svg';
import xrpIcon from './xrp.svg';
import zecIcon from './zec.svg';
import zroIcon from './zro.svg';

/**
 * Generic wrapper for a token icon asset. Defaults to `ImageSrc` for static
 * compile-time definitions (locally-imported SVGs). Use
 * `TokenIconMetadata<MetadataContextImageSrc>` for runtime/context data where token icons
 * may be sourced differently per platform (e.g. URL strings from the API on mobile).
 */
export type TokenIconMetadata<TAsset = ImageSrc> = { asset: TAsset };

export const TOKEN_ICONS = {
  aapl: {
    asset: aaplIcon,
  },
  aave: {
    asset: aaveIcon,
  },
  amzn: {
    asset: amznIcon,
  },
  aster: {
    asset: asterIcon,
  },
  avax: {
    asset: avaxIcon,
  },
  bch: {
    asset: bchIcon,
  },
  bnb: {
    asset: bnbIcon,
  },
  bonk: {
    asset: bonkIcon,
  },
  btc: {
    asset: btcIcon,
  },
  doge: {
    asset: dogeIcon,
  },
  ena: {
    asset: enaIcon,
  },
  eth: {
    asset: ethIcon,
  },
  eurusd: {
    asset: eurusdIcon,
  },
  gbpusd: {
    asset: gbpusdIcon,
  },
  goog: {
    asset: googIcon,
  },
  fartcoin: {
    asset: fartcoinIcon,
  },
  hype: {
    asset: hypeIcon,
  },
  jup: {
    asset: jupIcon,
  },
  kbtc: {
    asset: kbtcIcon,
  },
  kpepe: {
    asset: pepeIcon,
  },
  link: {
    asset: linkIcon,
  },
  lit: {
    asset: litIcon,
  },
  ltc: {
    asset: ltcIcon,
  },
  meta: {
    asset: metaIcon,
  },
  mon: {
    asset: monIcon,
  },
  msft: {
    asset: msftIcon,
  },
  nlp: {
    asset: nlpIcon,
  },
  nvda: {
    asset: nvdaIcon,
  },
  ondo: {
    asset: ondoIcon,
  },
  pengu: {
    asset: penguIcon,
  },
  pump: {
    asset: pumpIcon,
  },
  skr: {
    asset: skrIcon,
  },
  sol: {
    asset: solIcon,
  },
  sui: {
    asset: suiIcon,
  },
  tao: {
    asset: taoIcon,
  },
  tsla: {
    asset: tslaIcon,
  },
  uni: {
    asset: uniIcon,
  },
  usdjpy: {
    asset: usdjpyIcon,
  },
  usdc: {
    asset: usdcIcon,
  },
  usdt0: {
    asset: usdt0Icon,
  },
  useless: {
    asset: uselessIcon,
  },
  weth: {
    asset: wethIcon,
  },
  wlfi: {
    asset: wlfiIcon,
  },
  xaut: {
    asset: xautIcon,
  },
  xmr: {
    asset: xmrIcon,
  },
  xpl: {
    asset: xplIcon,
  },
  xrp: {
    asset: xrpIcon,
  },
  zec: {
    asset: zecIcon,
  },
  zro: {
    asset: zroIcon,
  },
  oil: {
    asset: oilIcon,
  },
  qqq: {
    asset: qqqIcon,
  },
  silver: {
    asset: silverIcon,
  },
  spy: {
    asset: spyIcon,
  },
} satisfies Record<string, TokenIconMetadata>;
