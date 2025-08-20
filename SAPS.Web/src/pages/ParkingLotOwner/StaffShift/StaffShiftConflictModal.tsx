import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import { StaffProfile } from '@/types/User';
import { TimeUtils } from '@/components/utils/staffShiftValidator';

export interface ShiftConflict {
   id: string;
   staffId: string[];
   staffName?: string[];
   conflictType: string;
   message: string;
   // conflictingShift?: StaffShift;
   staff?: StaffProfile;
   startTime: number;
   endTime: number;
   dayOfWeeks: string;
   shiftType: 'Regular' | 'Emergency';
}

interface StaffShiftConflictModalProps {
   isOpen: boolean;
   onOpenChange: () => void;
   conflicts: ShiftConflict[];
   onRetry?: () => void;
}

const StaffShiftConflictModal: React.FC<StaffShiftConflictModalProps> = ({
   isOpen,
   onOpenChange,
   conflicts,
   onRetry
}) => {
   // const formatTime = (minutes: number) => {
   //    const hours = Math.floor(minutes / 60);
   //    const mins = minutes % 60;
   //    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
   // };

   const formatDays = (daysString: string | null | undefined) => {
      if (!daysString) return 'N/A';
      const days = daysString.split(',').map(day => {
         const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
         return dayNames[parseInt(day) - 1] || day;
      });
      return days.join(', ');
   };
   const minutesToTime = (minutes: number): string => {
      return TimeUtils.minutesToTime(minutes);
   };

   return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
         <ModalContent>
            <ModalHeader className="flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-red-500" />
               <span>Staff Shift Conflicts Detected</span>
            </ModalHeader>
            <ModalBody>
               <div className="space-y-4">
                  <p className="text-gray-600">
                     The following conflicts were detected when trying to update the staff shift:
                  </p>

                  <div className="space-y-3">
                     {conflicts.map((conflict, index) => {
                        console.log(conflict);
                        return (
                           <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                              <div className="flex items-start justify-between mb-2">
                                 <div className="flex items-start gap-3">
                                    <Chip color="danger" variant="flat" size="sm">
                                       {conflict.conflictType}
                                    </Chip>
                                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                       <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                             <span className="font-semibold text-gray-900 text-sm">

                                                {/* {conflict.staffName || `Staff ID: ${conflict.staffId}`} */}
                                                {conflict.staffName?.join(', ')}

                                             </span>
                                          </div>

                                          <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                                            

                                             <div className="flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-700">
                                                   {minutesToTime(conflict.startTime) || '00:00'} - {minutesToTime(conflict.endTime || 0)}
                                                </span>
                                             </div>

                                             <div className="flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium text-gray-700">
                                                   {formatDays(conflict.dayOfWeeks)}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <p className="text-sm text-gray-700 mb-2">
                                 {conflict.message}
                              </p>
                           </div>
                        )
                     })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                     <p className="text-sm text-blue-800">
                        <strong>How to resolve:</strong> Please review the conflicting shifts and adjust the schedule to avoid overlapping shifts for the same staff member.
                     </p>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <Button color="danger" variant="light" onPress={onOpenChange}>
                  Close
               </Button>
               {onRetry && (
                  <Button color="primary" onPress={onRetry}>
                     Try Again
                  </Button>
               )}
            </ModalFooter>
         </ModalContent>
      </Modal>
   );
};

export default StaffShiftConflictModal; 