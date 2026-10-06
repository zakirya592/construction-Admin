import { Button, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
export function DataTable({ label, rows, columns, onEdit, onDelete, empty, }) {
    const showActions = Boolean(onEdit || onDelete);
    if (rows.length === 0) {
        return (<div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">Nothing on this list</p>
        <p className="mt-2 text-sm text-stone-500">{empty}</p>
      </div>);
    }
    return (<div className="office-table-scroll overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_1px_0_rgb(28_25_20_/_0.04)]">
      <Table className="w-max min-w-full overflow-visible">
        <Table.ScrollContainer className="overflow-visible">
          <Table.Content aria-label={label} className="w-max min-w-full">
            <Table.Header>
              {columns.map((column) => (<Table.Column key={column.header} isRowHeader={column.rowHeader} className="whitespace-nowrap">
                  {column.header}
                </Table.Column>))}
              {showActions && <Table.Column className="whitespace-nowrap">Actions</Table.Column>}
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (<Table.Row key={row.id} id={row.id}>
                  {columns.map((column) => (<Table.Cell key={column.header} className="whitespace-nowrap">{column.cell(row)}</Table.Cell>))}
                  {showActions && (<Table.Cell>
                    <div className="flex gap-1">
                      {onEdit && (<Button isIconOnly aria-label={`Edit ${label} row`} variant="ghost" size="sm" onPress={() => onEdit(row)}>
                        <Pencil size={15}/>
                      </Button>)}
                      {onDelete && (<Button isIconOnly aria-label={`Remove ${label} row`} variant="ghost" size="sm" onPress={() => onDelete(row)}>
                        <Trash2 size={15}/>
                      </Button>)}
                    </div>
                  </Table.Cell>)}
                </Table.Row>))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>);
}
