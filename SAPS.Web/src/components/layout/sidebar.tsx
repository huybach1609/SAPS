import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, Input, Listbox, ListboxItem } from "@heroui/react";
import { EllipsisVertical, LogOut, Plus, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeSwitch } from "../theme-switch";
import blankProfile from "../../assets/Default/blank-profile-picture.webp"

interface SidebarProps {
    isOpen: boolean;
}


const HeadingBar: React.FC = () => {
    return (
        <div className="flex justify-between items-center my-4">
            <div className="flex items-center gap-2">
                <img src={blankProfile} alt="Profile" className="w-12 h-12 rounded-full m-2" />
                <div>
                    <h2 className="text-medium font-bold ">Admin John</h2>
                    <h2 className="text-xs ">Head Administrator</h2>
                </div>
            </div>


            <Dropdown>
                <DropdownTrigger>
                    <Button className="bg-transparent text-background " isIconOnly><EllipsisVertical /></Button>
                </DropdownTrigger>
                <DropdownMenu className="dark">
                    <DropdownItem key="settings">

                        <button className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                            ><Settings size={16}/>Settings</button>

                    </DropdownItem>

                    <DropdownItem key="changeThemes">
                        <ThemeSwitch
                            variant="button"
                            showLabel={true}
                            className="w-full"
                        />
                    </DropdownItem>
                    <DropdownItem key="logout">

                        <button className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                            ><LogOut size={16}/>Logout</button>

                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};

export const SideBar: React.FC<SidebarProps> = ({ isOpen }) => {

    return (
        <motion.div
            initial={false}
            animate={{
                width: isOpen ? 300 : 0,
                opacity: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}

            className=" 
            bg-foreground text-background border-r border-divider h-full flex flex-col
            p-5 shadow-lg overflow-hidden
            "
        >
            <HeadingBar />
            <Divider className="bg-border" />

        </motion.div>
    );
};
