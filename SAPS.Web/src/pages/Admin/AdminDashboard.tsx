import DefaultLayout from "@/layouts/default"
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <DefaultLayout title="Admin Dashboard" >
            <Outlet />
        </DefaultLayout>
    );
}