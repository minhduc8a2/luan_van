import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatArea from "./ChatArea/ChatArea";
import BrowseFiles from "./BrowseFiles/BrowseFiles";
import BrowseChannels from "./BrowseChannels/BrowseChannels";
import BrowseUsers from "./BrowseUsers/BrowseUsers";
import Layout from "./Layout";
import Admin from "./Admin/Admin";

import Settings from "./Admin/Settings/Settings";
import ManageMembers from "./Admin/ManageMembers";
import Home from "./Admin/Home";
import AccountAndProfile from "./Admin/AccountAndProfile/AccountAndProfile";
export default function Index() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/workspaces/:workspaceId/admin"
                    element={<Admin />}
                >
                    <Route path="home" element={<Home />} />
                    <Route
                        path="account_profile"
                        element={<AccountAndProfile />}
                    />
                    <Route path="manage_members" element={<ManageMembers />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="/workspaces/:workspaceId" element={<Layout />}>
                    <Route path="channels/:channelId" element={<ChatArea />} />
                    <Route path="browse_files" element={<BrowseFiles />} />
                    <Route
                        path="browse_channels"
                        element={<BrowseChannels />}
                    />
                    <Route path="browse_users" element={<BrowseUsers />} />
                </Route>
            </Routes>
        </Router>
    );
}
