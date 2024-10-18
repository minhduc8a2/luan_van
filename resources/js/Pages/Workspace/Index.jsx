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
import HomePage from "./HomePage/HomePage";
import ReduxProvider from "@/Components/ReduxProvider";
import AboutWorkspace from "./Admin/AboutWorkspace";

export default function Index() {
    return (
        <Router>
            <Routes>
                <Route path="/workspaces" element={<ReduxProvider />}>
                    <Route path="" element={<HomePage />} />
                    <Route path=":workspaceId/admin" element={<Admin />}>
                        <Route path="home" element={<Home />} />
                        <Route
                            path="about_workspace"
                            element={<AboutWorkspace />}
                        />
                        <Route
                            path="account_profile"
                            element={<AccountAndProfile />}
                        />
                        <Route
                            path="manage_members"
                            element={<ManageMembers />}
                        />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path=":workspaceId" element={<Layout />}>
                        <Route
                            path="channels/:channelId"
                            element={<ChatArea />}
                        />
                        <Route path="browse_files" element={<BrowseFiles />} />
                        <Route
                            path="browse_channels"
                            element={<BrowseChannels />}
                        />
                        <Route path="browse_users" element={<BrowseUsers />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}
