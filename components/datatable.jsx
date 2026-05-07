"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Trash2,
  Pencil,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ColumnDef
 * @property {string} key Field key from Strapi response (supports dot paths like "photo.url")
 * @property {string} label Column header label
 * @property {(value: any, row: any) => any} [render] Optional custom cell renderer
 * @property {boolean} [hidden] Hide this column
 */

/**
 * @typedef {Object} StrapiMeta
 * @property {{ page: number, pageSize: number, pageCount: number, total: number }} pagination
 */

/**
 * @typedef {Object} StrapiDataTableProps
 * @property {string} endpoint e.g. "api/faqs"
 * @property {string} [deleteEndpoint] e.g. "api/faqs" — uses documentId automatically
 * @property {ColumnDef[]} columns Columns to display
 * @property {() => void} [onAdd]
 * @property {(row: any) => void} [onEdit]
 * @property {(row: any) => void} [onView]
 * @property {string} [title]
 * @property {string} [addLabel]
 * @property {number} [pageSize]
 * @property {boolean} [searchable]
 * @property {string} [sortField]
 */

// ─── Component ───────────────────────────────────────────────────────────────

/** @param {StrapiDataTableProps} props */
export function StrapiDataTable(props) {
  const {
    endpoint,
    deleteEndpoint,
    columns,
    onAdd,
    onEdit,
    onView,
    title = "Records",
    addLabel = "Add New",
    pageSize = 10,
    sortField = "createdAt:desc",
  } = props;
  /** @type {[any[], (next: any[]) => void]} */
  const [data, setData] = useState([]);
  /** @type {[StrapiMeta | null, (next: StrapiMeta | null) => void]} */
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Delete confirmation dialog
  /** @type {[any | null, (next: any | null) => void]} */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ Fetch data from Strapi
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${endpoint}?pagination[page]=${page}&pagination[pageSize]=${currentPageSize}&sort=${sortField}&populate=*`
      );
      setData(res.data?.data ?? []);
      setMeta(res.data?.meta ?? null);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, currentPageSize, sortField]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const base = deleteEndpoint ?? endpoint;
      await apiClient.delete(`${base}/${deleteTarget.documentId}`);
      toast.success("Deleted successfully.");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete.");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ Resolve nested value e.g. "image.url"
  const resolveValue = (row, key) => {
    return key.split(".").reduce((acc, k) => acc?.[k], row);
  };

  const visibleColumns = columns.filter((c) => !c.hidden);
  const totalPages = meta?.pagination?.pageCount ?? 1;
  const totalRecords = meta?.pagination?.total ?? 0;

  return (
    <div className="space-y-2">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">

       
            {totalRecords} total records
   
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-xs">#</TableHead>
              {visibleColumns.map((col) => (
                <TableHead key={col.key} className="text-xs font-semibold">
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="text-xs text-right font-semibold w-20">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 2}
                  className="text-center py-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#006caf]" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 2}
                  className="text-center py-20 text-muted-foreground text-sm"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.documentId ?? row.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  {/* Row number */}
                  <TableCell className="text-xs text-muted-foreground">
                    {(page - 1) * currentPageSize + index + 1}
                  </TableCell>

                  {/* Data columns */}
                  {visibleColumns.map((col) => {
                    const value = resolveValue(row, col.key);
                    return (
                      <TableCell key={col.key} className="text-sm max-w-xs">
                        {col.render ? (
                          col.render(value, row)
                        ) : typeof value === "boolean" ? (
                          <Badge variant={value ? "default" : "secondary"}>
                            {value ? "Yes" : "No"}
                          </Badge>
                        ) : value === null || value === undefined ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          <span className="line-clamp-2">
                            {/* Strip HTML tags for display */}
                            {String(value).replace(/<[^>]*>/g, "")}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(row)}>
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {deleteEndpoint !== undefined || endpoint ? (
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(row)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {!loading && totalRecords > 0 && (
        <div className="flex items-center justify-between">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(currentPageSize)}
              onValueChange={(val) => {
                setCurrentPageSize(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page info + controls */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this record? This action{" "}
            <span className="font-semibold text-foreground">cannot be undone</span>.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}