import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_equals,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type Attending = "yes" | "no" | "maybe"

export type RsvpItem = {
  id: string
  guestName: string
  attending: Attending
  partySize: number
  message: string | null
  contact: string | null
  createdAt: string
}

const ATTENDING_LABEL: Record<Attending, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
}
const ATTENDING_CLASS: Record<Attending, string> = {
  yes: "bg-emerald-400/15 text-emerald-300",
  maybe: "bg-amber-400/15 text-amber-300",
  no: "bg-muted text-muted-foreground",
}
const ATTENDING_ORDER: Record<Attending, number> = { yes: 0, maybe: 1, no: 2 }

const submitted = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
})

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text },
  filterFns: { equals: filterFn_equals },
})

const helper = createColumnHelper<typeof features, RsvpItem>()

const columns = helper.columns([
  helper.accessor("guestName", {
    header: "Name",
    sortFn: "text",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  helper.accessor("attending", {
    header: "Attending",
    filterFn: "equals",
    sortFn: (a, b) =>
      ATTENDING_ORDER[a.original.attending] -
      ATTENDING_ORDER[b.original.attending],
    cell: (info) => {
      const value = info.getValue()
      return (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            ATTENDING_CLASS[value]
          )}
        >
          {ATTENDING_LABEL[value]}
        </span>
      )
    },
  }),
  helper.accessor("partySize", {
    header: "Party",
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
  helper.accessor("message", {
    header: "Message",
    enableSorting: false,
    cell: (info) => (
      <span className="line-clamp-3 min-w-48 whitespace-pre-line">
        {info.getValue() ?? ""}
      </span>
    ),
  }),
  helper.accessor("contact", {
    header: "Contact",
    enableSorting: false,
    cell: (info) => <span className="break-all">{info.getValue() ?? ""}</span>,
  }),
  helper.accessor("createdAt", {
    header: "Date",
    sortFn: (a, b) =>
      a.original.createdAt < b.original.createdAt
        ? -1
        : a.original.createdAt > b.original.createdAt
          ? 1
          : 0,
    cell: (info) => (
      <time dateTime={info.getValue()} className="whitespace-nowrap">
        {submitted.format(new Date(info.getValue()))}
      </time>
    ),
  }),
])

const FILTERS: Array<{ value: Attending | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
]

export function RsvpTable({ data }: { data: Array<RsvpItem> }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useTable({
    features,
    columns,
    data,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })
  const attendingFilter =
    (columnFilters.find((f) => f.id === "attending")?.value as
      Attending | undefined) ?? "all"
  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filter by attending"
        className="flex flex-wrap gap-1.5"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={attendingFilter === f.value}
            onClick={() =>
              setColumnFilters(
                f.value === "all" ? [] : [{ id: "attending", value: f.value }]
              )
            }
            className={cn(
              "h-8 rounded-full border px-3 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              attendingFilter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const Icon =
                    sorted === "asc"
                      ? ArrowUp
                      : sorted === "desc"
                        ? ArrowDown
                        : ArrowUpDown
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <table.FlexRender header={header} />
                          <Icon
                            className={cn(
                              "size-3.5",
                              !sorted && "text-muted-foreground/60"
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  {data.length === 0
                    ? "No RSVPs yet. Share your link to start collecting answers."
                    : "No RSVPs match this filter."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
