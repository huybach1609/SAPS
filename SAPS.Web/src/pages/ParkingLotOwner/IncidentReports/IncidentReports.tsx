import React, { useEffect, useState } from 'react';
import DefaultLayout from "@/layouts/default";
import { Card, CardHeader, CardBody, Input, Select, SelectItem, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Pagination } from '@heroui/react';
import { IncidentReport, IncidentStatus, IncidentPriority } from '@/types/IncidentReport';
import { formatDateTime, formatTime } from '../ParkingHistory/HistoryManagement/ParkingHistoryDetail';
import { Eye } from 'lucide-react';
import { useParkingLot } from '../ParkingLotContext';
import { fetchIncidents } from '@/services/parkinglot/incidentService';
import { PaginationInfo } from '@/types/Whitelist';
import { useNavigate } from 'react-router-dom';
import { s } from 'framer-motion/client';

const statusOptions = [
    { key: '', label: 'All Status' },
    { key: IncidentStatus.Open, label: 'Open' },
    { key: IncidentStatus.InProgress, label: 'In Progress' },
    { key: IncidentStatus.Resolved, label: 'Resolved' },
    { key: IncidentStatus.Closed, label: 'Closed' },
];

const priorityOptions = [
    { key: '', label: 'All Priority' },
    { key: IncidentPriority.Low, label: 'Low' },
    { key: IncidentPriority.Medium, label: 'Medium' },
    { key: IncidentPriority.High, label: 'High' },
    { key: IncidentPriority.Critical, label: 'Critical' },
];

const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
        case IncidentStatus.Open:
            return 'bg-cyan-100 text-cyan-800';
        case IncidentStatus.InProgress:
            return 'bg-blue-200 text-blue-800';
        case IncidentStatus.Resolved:
            return 'bg-green-200 text-green-800';
        case IncidentStatus.Closed:
            return 'bg-gray-200 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
        case IncidentPriority.Low:
            return 'bg-gray-200 text-gray-800';
        case IncidentPriority.Medium:
            return 'bg-blue-200 text-blue-800';
        case IncidentPriority.High:
            return 'bg-yellow-200 text-yellow-800';
        case IncidentPriority.Critical:
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function IncidentReports() {
    const { parkingLot, loading: parkingLotLoading } = useParkingLot();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [incidents, setIncidents] = useState<IncidentReport[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const navigate = useNavigate();

    // Fetch incidents from API
    useEffect(() => {
        if (!parkingLot?.id) return;
        setLoading(true);
        console.log(status, priority, date, search);
        fetchIncidents(
            parkingLot.id,
            pageSize,
            currentPage,
            search,
            date ? date : undefined,
            date ? date : undefined,
            status !== '' ? Number(status) : undefined,
            priority !== '' ? Number(priority) : undefined
        )
            .then(res => {
                setIncidents(res.data);
                setPagination(res.pagination);
            })
            .catch(err => {
                setIncidents([]);
                setPagination(null);
            })
            .finally(() => setLoading(false));
    }, [parkingLot?.id, search, status, priority, date, currentPage]);

    return (
        <DefaultLayout title="Incident Reports">
            <Card className="bg-background-100/20 mb-6 ">
                <CardHeader className="flex items-center gap-2">
                    <span role="img" aria-label="search">🔍</span>
                    <h2 className="font-bold">Search &amp; Filter Incidents</h2>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-wrap gap-2 items-center w-full">
                        <Input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by incident ID, description..."
                            className="w-64"
                            size="sm"
                            color='primary'
                        />
                        <Select
                            aria-label="Filter by Status"
                            placeholder="All Status"
                            className="w-40"
                            size="sm"
                            selectedKeys={status === '' ? new Set() : new Set([status])}
                            onSelectionChange={keys => setStatus(Array.from(keys)[0]?.toString() ?? '')}
                            color='primary'
                        >
                            {statusOptions.map(opt => (
                                <SelectItem key={opt.key} textValue={opt.label}> 
                                <div
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(opt.key as IncidentStatus)}`}
                                >{opt.label}</div>

                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            aria-label="Filter by Priority"
                            placeholder="All Priority"
                            className="w-40"
                            size="sm"
                            selectedKeys={priority === '' ? new Set() : new Set([priority])}
                            onSelectionChange={keys => setPriority(Array.from(keys)[0]?.toString() ?? '')}
                            color='primary'
                        >
                            {priorityOptions.map(opt => (
                                <SelectItem key={opt.key} textValue={opt.label}>
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(opt.key as IncidentPriority)}`}>{opt.label}</div>
                                </SelectItem>
                            ))}
                        </Select>

                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-40"
                            size="sm"
                            color='primary'
                        />
                        <Button size="sm" color="primary" className="text-background">Search</Button>
                    </div>
                </CardBody>
            </Card>
            <Card>
                <CardHeader className="font-bold">Recent Incident Reports</CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-[78vh]">
                                <Spinner />
                            </div>
                        ) : (
                            <Table aria-label="Incident Reports Table">
                                <TableHeader>
                                    <TableColumn>Incident ID</TableColumn>
                                    <TableColumn>Type</TableColumn>
                                    <TableColumn>Description</TableColumn>
                                    <TableColumn>Reported By</TableColumn>
                                    <TableColumn>Date &amp; Time</TableColumn>
                                    <TableColumn>Priority</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                    <TableColumn>Actions</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {incidents.map(inc => (
                                        <TableRow key={inc.id}>
                                            <TableCell className="text-primary font-bold cursor-pointer">{inc.id}</TableCell>
                                            <TableCell>{inc.header}</TableCell>
                                            <TableCell className='flex flex-col'>
                                                <span>{inc.description}</span>
                                                <span className='text-xs text-background-900/60'>{inc.descriptionNote}</span>
                                            </TableCell>
                                            <TableCell className=''>
                                                <div className='flex flex-col'>
                                                    <span className='text-primary font-bold cursor-pointer'>{inc.reporter?.name}</span>
                                                    <span className='text-xs text-background-900/60'>{inc.reporter?.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='flex flex-col'>
                                                <span>{formatDateTime(inc.reportedDate)}</span>
                                                <span className='text-xs text-background-900/60'>{formatTime(inc.reportedDate)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(inc.priority)}`}>
                                                    {IncidentPriority[inc.priority]}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(inc.status)}`}>
                                                    {IncidentStatus[inc.status]}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button isIconOnly color="secondary" className="text-background" onPress={() => {
                                                    navigate(`/owner/incidents/${parkingLot?.id}/${inc.id}`);
                                                }}>
                                                    <Eye className="w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardBody>
            </Card>
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm ">
                        Showing page {pagination.currentPage} of {pagination.totalPages}
                        ({pagination.totalItems} total items)
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                            }}
                            disabled={!pagination.hasPreviousPage || parkingLotLoading}
                            className=""
                        >
                            Previous
                        </Button>
                        <Pagination color="secondary" className='text-white' page={pagination.currentPage} total={pagination.totalPages} onChange={setCurrentPage} isDisabled={parkingLotLoading} />
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev < pagination.totalPages ? prev + 1 : prev))
                            }}
                            disabled={!pagination.hasNextPage || parkingLotLoading}
                            className=""
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}


        </DefaultLayout>
    );
}