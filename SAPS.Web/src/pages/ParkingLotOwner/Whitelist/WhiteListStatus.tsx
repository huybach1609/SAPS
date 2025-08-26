// import { fetchWhitelistStatus } from "@/services/parkinglot/whitelistService";
import { WhitelistStatus } from "@/types/Whitelist";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { BarChart } from "lucide-react";
import { useEffect, useState } from "react";

function WhitelistStatusComponent({ parkingLotId, loadparking }: { parkingLotId: string, loadparking: boolean }) {
    const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatus | null>(null);


    const fetch = async () => {
        console.log(parkingLotId);
        // const status = await fetchWhitelistStatus(parkingLotId);
        setWhitelistStatus(null);
    };

    useEffect(() => {
        if (!loadparking) {
            fetch();
        }
    }, [loadparking]);


    return (

        <Card className="bg-background-100/20 mb-6 hidden">
            <CardHeader className="flex items-center gap-2">
                <BarChart className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-bold">Whitelist Status</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.tottalWhitelistUsers}</p>
                    <p className="text-sm">Total Whitelisted Users</p>
                </div>
                <div className="bg-primary-900/80 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.activeUser}</p>
                    <p className="text-sm">Active Today</p>
                </div>
                <div className="bg-primary-900/70 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.expiringThisWeek}</p>
                    <p className="text-sm">Expiring This Week</p>
                </div>
            </CardBody>
        </Card>
    );

}
export default WhitelistStatusComponent;