import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrashService } from './trash.service';

@ApiTags('Trash')
@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  @ApiOperation({ summary: 'Get summary of all trashed items' })
  getSummary() {
    return this.trashService.getTrashSummary();
  }

  @Get(':entity')
  @ApiOperation({ summary: 'Get all trashed items for an entity' })
  findAll(@Param('entity') entity: string) {
    return this.trashService.findAll(entity);
  }

  @Post(':entity/:id/restore')
  @ApiOperation({ summary: 'Restore a trashed item' })
  restore(@Param('entity') entity: string, @Param('id', ParseIntPipe) id: number) {
    return this.trashService.restore(entity, id);
  }

  @Post(':entity/:id/force')
  @ApiOperation({ summary: 'Permanently delete a trashed item' })
  forceDelete(@Param('entity') entity: string, @Param('id', ParseIntPipe) id: number) {
    return this.trashService.forceDelete(entity, id);
  }
}
