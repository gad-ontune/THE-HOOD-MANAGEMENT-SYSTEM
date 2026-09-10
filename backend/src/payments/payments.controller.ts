import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.paymentsService.findAll(query);
  }

  @Post()
  async create(@Body() body: any) {
    return this.paymentsService.create(body);
  }

  @Get('invoice/:id')
  async getInvoice(@Param('id') id: string) {
    return this.paymentsService.getInvoice(+id);
  }

  @Post('refund')
  async refund(@Body() body: { paymentId: number; amount: number; reason: string }) {
    return this.paymentsService.refund(body.paymentId, { amount: body.amount, reason: body.reason });
  }
}
