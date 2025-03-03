import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TokenService } from "../../core/token.service";
import { TokenMetadata } from './token.type';
import { getEndTime } from 'src/core/lib/utils';

@Controller('tokens')
export class TokenController {
    constructor(
        private readonly service: TokenService,
    ) {}

    @Get()
    async getTokenList() {
        return await this.service.getTokenList(false);
    }

    @Get('/launched')
    async getLaunchedTokenList() {
        return await this.service.getTokenList(true);
    }

    @Get('/trade_history/:tokenMint')
    async getTradeHistory(@Param() params: any) {
        const tokenMint = params.tokenMint
        return await this.service.getTradeHistory(tokenMint);
    }

    @Get('/current_time')
    async getCurrentTime() {
        const now = new Date()
        return now.getTime()
    }

    @Get('/get_endtime')
    async getTimer() {
        return getEndTime()
    }
    @Get('/staker_count')
    async getStakerCount() {
        return await this.service.getStakerCount();
    }
    // @Get('/top2')
    // async getTop2() {
    //     return await this.service.getTop2();
    // }
    @Get(':id')
    async getItem(@Param() params: any) {
        const tokenMint = params.id;
        return await this.service.getToken(tokenMint);
    }
    @Get('walletinfo/:address/:filter')
    async getWalletInfo(@Param() params: any) {
        const addr = params.address;
        const filter = params.filter; // 0: Active tokens, 1: All tokens
        return await this.service.getTokensSearch(addr, filter);
    }
    @Post('ipfs')
    @UseInterceptors(FileInterceptor('file'))
    async postIpfs(@Body() metadata: TokenMetadata, @UploadedFile() file: Express.Multer.File) {
        return await this.service.postMetadata(metadata, file);

    }
    @Get('dataseed/:id')
    async getDataSeed(@Param() params: any, @Query() querys: any) {
        const {id: tokenMint } = params;
        const {resolution, from, to} = querys
        return await this.service.getDataSeed(tokenMint, resolution, Number(from), Number(to));
    }
}