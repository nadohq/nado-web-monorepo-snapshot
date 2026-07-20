import type { ImageSrc } from '../../../../types/ImageSrc';
import aaplIcon from './aapl.svg';
import aaplxIcon from './aaplx.svg';
import aaveIcon from './aave.svg';
import amdIcon from './amd.svg';
import amznIcon from './amzn.svg';
import amznxIcon from './amznx.svg';
import asterIcon from './aster.svg';
import avaxIcon from './avax.svg';
import avgoIcon from './avgo.svg';
import bbxIcon from './bbx.svg';
import bchIcon from './bch.svg';
import bnbIcon from './bnb.svg';
import bonkIcon from './bonk.svg';
import btcIcon from './btc.svg';
import chipIcon from './chip.svg';
import dellIcon from './dell.svg';
import dogeIcon from './doge.svg';
import enaIcon from './ena.svg';
import ethIcon from './eth.svg';
import eurusdIcon from './eurusd.svg';
import fartcoinIcon from './fartcoin.svg';
import gbpusdIcon from './gbpusd.svg';
import googIcon from './goog.svg';
import googlxIcon from './googlx.svg';
import gramIcon from './gram.svg';
import hypeIcon from './hype.svg';
import intcIcon from './intc.svg';
import jupIcon from './jup.svg';
import kbtcIcon from './kbtc.svg';
import linkIcon from './link.svg';
import litIcon from './lit.svg';
import ltcIcon from './ltc.svg';
import megaIcon from './mega.svg';
import metaIcon from './meta.svg';
import metaxIcon from './metax.svg';
import monIcon from './mon.svg';
import mrvlIcon from './mrvl.svg';
import msftIcon from './msft.svg';
import msftxIcon from './msftx.svg';
import mstrIcon from './mstr.svg';
import muIcon from './mu.svg';
import nearIcon from './near.svg';
import nlpIcon from './nlp.svg';
import nvdaIcon from './nvda.svg';
import nvdaxIcon from './nvdax.svg';
import oilIcon from './oil.svg';
import ondoIcon from './ondo.svg';
import pengIcon from './peng.svg';
import penguIcon from './pengu.svg';
import pepeIcon from './pepe.svg';
import pumpIcon from './pump.svg';
import qqqIcon from './qqq.svg';
import qqqxIcon from './qqqx.svg';
import silverIcon from './silver.svg';
import skrIcon from './skr.svg';
import skyIcon from './sky.svg';
import sndkIcon from './sndk.svg';
import solIcon from './sol.svg';
import spcxIcon from './spcx.svg';
import spyIcon from './spy.svg';
import spyxIcon from './spyx.svg';
import suiIcon from './sui.svg';
import taoIcon from './tao.svg';
import tslaIcon from './tsla.svg';
import tslaxIcon from './tslax.svg';
import uniIcon from './uni.svg';
import usdcIcon from './usdc.svg';
import usdjpyIcon from './usdjpy.svg';
import usdt0Icon from './usdt0.svg';
import uselessIcon from './useless.svg';
import vvvIcon from './vvv.svg';
import wethIcon from './weth.svg';
import wldIcon from './wld.svg';
import wlfiIcon from './wlfi.svg';
import xautIcon from './xaut.svg';
import xaut0Icon from './xaut0.svg';
import xmrIcon from './xmr.svg';
import xplIcon from './xpl.svg';
import xrpIcon from './xrp.svg';
import zecIcon from './zec.svg';
import zhipuIcon from './zhipu.svg';
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
  aaplx: {
    asset: aaplxIcon,
  },
  aave: {
    asset: aaveIcon,
  },
  amd: {
    asset: amdIcon,
  },
  amzn: {
    asset: amznIcon,
  },
  amznx: {
    asset: amznxIcon,
  },
  aster: {
    asset: asterIcon,
  },
  avax: {
    asset: avaxIcon,
  },
  avgo: {
    asset: avgoIcon,
  },
  bbx: {
    asset: bbxIcon,
  },
  bch: {
    asset: bchIcon,
  },
  chip: {
    asset: chipIcon,
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
  dell: {
    asset: dellIcon,
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
  fartcoin: {
    asset: fartcoinIcon,
  },
  gbpusd: {
    asset: gbpusdIcon,
  },
  goog: {
    asset: googIcon,
  },
  googlx: {
    asset: googlxIcon,
  },
  gram: {
    asset: gramIcon,
  },
  hype: {
    asset: hypeIcon,
  },
  intc: {
    asset: intcIcon,
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
  mega: {
    asset: megaIcon,
  },
  meta: {
    asset: metaIcon,
  },
  metax: {
    asset: metaxIcon,
  },
  mon: {
    asset: monIcon,
  },
  mrvl: {
    asset: mrvlIcon,
  },
  msft: {
    asset: msftIcon,
  },
  msftx: {
    asset: msftxIcon,
  },
  mstr: {
    asset: mstrIcon,
  },
  mu: {
    asset: muIcon,
  },
  near: {
    asset: nearIcon,
  },
  nlp: {
    asset: nlpIcon,
  },
  nvda: {
    asset: nvdaIcon,
  },
  nvdax: {
    asset: nvdaxIcon,
  },
  oil: {
    asset: oilIcon,
  },
  ondo: {
    asset: ondoIcon,
  },
  peng: {
    asset: pengIcon,
  },
  pengu: {
    asset: penguIcon,
  },
  pump: {
    asset: pumpIcon,
  },
  qqq: {
    asset: qqqIcon,
  },
  qqqx: {
    asset: qqqxIcon,
  },
  silver: {
    asset: silverIcon,
  },
  skr: {
    asset: skrIcon,
  },
  sky: {
    asset: skyIcon,
  },
  sndk: {
    asset: sndkIcon,
  },
  sol: {
    asset: solIcon,
  },
  spcx: {
    asset: spcxIcon,
  },
  spy: {
    asset: spyIcon,
  },
  spyx: {
    asset: spyxIcon,
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
  tslax: {
    asset: tslaxIcon,
  },
  uni: {
    asset: uniIcon,
  },
  usdc: {
    asset: usdcIcon,
  },
  usdjpy: {
    asset: usdjpyIcon,
  },
  usdt0: {
    asset: usdt0Icon,
  },
  useless: {
    asset: uselessIcon,
  },
  vvv: {
    asset: vvvIcon,
  },
  weth: {
    asset: wethIcon,
  },
  wld: {
    asset: wldIcon,
  },
  wlfi: {
    asset: wlfiIcon,
  },
  xaut: {
    asset: xautIcon,
  },
  xaut0: {
    asset: xaut0Icon,
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
  zhipu: {
    asset: zhipuIcon,
  },
  zro: {
    asset: zroIcon,
  },
} satisfies Record<string, TokenIconMetadata>;
