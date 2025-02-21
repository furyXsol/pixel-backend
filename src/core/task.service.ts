import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SolanaPixelService } from './solana_pixel_service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private SYNCING: { [key: string]: boolean } = {};
  constructor(
    private readonly solanaPixel: SolanaPixelService,
  ) {
    this.SYNCING['syncCreateTokenBuySellEvents'] = false
    // this.SYNCING['syncNotReachedSOL'] = false
    this.SYNCING['syncCreateRaydiumPool'] = false
    this.SYNCING['syncSendSolToBuyer'] = false
    this.SYNCING['syncBurnLpToken'] = false
  }

  @Cron('*/10 * * * * *')
  async syncCreateTokenBuySellEvents() {
    if (this.SYNCING['syncCreateTokenBuySellEvents']) return
    this.logger.log('syncing Solana CreateToken Buy Events')
    try {
      this.SYNCING['syncCreateTokenBuyEvents'] = true
      await this.solanaPixel.syncCreateTokenBuySellEvents()
    } catch(error) {
      this.logger.error('Sync createBuyToken Buy Events:', JSON.stringify(error))
    } finally {
      this.SYNCING['syncCreateTokenBuySellEvents'] = false
    }
  }

  /// withdraw from bonding-curve and create Raydium Pool
  @Cron('*/10 * * * * *')
  async syncCreateLaydiumPool() {
    if (this.SYNCING['syncCreateRaydiumPool']) return
    this.logger.log('syncing Creating Raydium Pool')
    try{
      this.SYNCING['syncCreateRaydiumPool'] = true
      await this.solanaPixel.syncCreateLaydiumPool()
    } catch(error) {
      this.logger.error('Sync Creating Raydium Pool:', JSON.stringify(error))
    } finally {
      this.SYNCING['syncCreateRaydiumPool'] = false
    }
  }

  //every 2 munites
  @Cron('*/2 * * * *')
  async syncBurnLpToken() {
    if (this.SYNCING['syncBurnLpToken']) return
    this.logger.log('syncing Burn LpToken')
    try{
      this.SYNCING['syncBurnLpToken'] = true
      await this.solanaPixel.syncLpToken()
    } catch(error) {
      this.logger.error('Sync Burn LpToken:', JSON.stringify(error))
    } finally {
      this.SYNCING['syncBurnLpToken'] = false
    }
  }
}