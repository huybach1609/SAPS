import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Edit2, Trash2 } from "lucide-react";
import type { Whitelist } from "@/types/Whitelist";

export type WhitelistTableProps = {
  whitelist: Whitelist[];
  onEdit: (entry: Whitelist) => void;
  onRemove: (clientId: string) => void;
};

export function WhitelistTable({ whitelist, onEdit, onRemove }: WhitelistTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table aria-label="Whitelist Table">
        <TableHeader>
          <TableColumn key="user" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </TableColumn>
          <TableColumn key="addedDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Added Date
          </TableColumn>
          <TableColumn key="expiryDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Expiry Date
          </TableColumn>
          <TableColumn key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </TableColumn>
          <TableColumn key="actions" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {whitelist.map((entry) => {
            const isExpired = entry.expiredDate && new Date(entry.expiredDate) < new Date();
            const isActive = !entry.expiredDate || !isExpired;

            return (
              <TableRow key={entry.clientId}>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {entry.client?.profileImageUrl ? (
                        <img
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                          src={entry.client.profileImageUrl}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {entry.fullName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.fullName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.email || entry.clientId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(entry.addedDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.expiredDate
                    ? new Date(entry.expiredDate).toLocaleDateString()
                    : "No expiry"}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span
                    data-testid={isActive ? "active-badge" : "expired-badge"}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    aria-label={`Edit ${entry.clientId || "Unknown User"}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    data-testid={`edit-button-${entry.clientId}`}
                    startContent={<Edit2 className="w-4 h-4" />}
                    variant="light"
                    onPress={() => onEdit(entry)}
                  />
                  <Button
                    isIconOnly
                    aria-label={`Remove ${entry.client?.fullName || "Unknown User"}`}
                    className="text-red-600 hover:text-red-900"
                    startContent={<Trash2 className="w-4 h-4" />}
                    variant="light"
                    onPress={() => onRemove(entry.clientId)}
                  />
                </TableCell>
              </TableRow>
            )
          }
          )}
        </TableBody>
      </Table>
    </div>
  );
}