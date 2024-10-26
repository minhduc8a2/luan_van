import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatArea from "./ChatArea/ChatArea";
import BrowseFiles from "./BrowseFiles/BrowseFiles";
import BrowseChannels from "./BrowseChannels/BrowseChannels";
import BrowseUsers from "./BrowseUsers/BrowseUsers";
import Layout from "./Layout";
import Admin from "./Admin/Admin";

import Settings from "./Admin/Settings/Settings";
import ManageMembers from "./Admin/ManageMember/ManageMembers";
import Home from "./Admin/Home";
import AccountAndProfile from "./Admin/AccountAndProfile/AccountAndProfile";
import HomePage from "./HomePage/HomePage";
import ReduxProvider from "@/Components/ReduxProvider";
import AboutWorkspace from "./Admin/AboutWorkspace/AboutWorkspace";
import Invitations from "./Admin/Invitations/Invitations";
import OnlineStatusProvider from "@/services/OnlineStatusProvider";
import UserNotificationEventHandlersProvider from "@/services/UserNotificationEventHandlersProvider";
import WorkspaceEventHandlersProvider from "@/services/WorkspaceEventHandlersProvider";
import ChannelEventHandlersProvider from "@/services/ChannelEventHandlersProvider";
import AdminEventHandlersProvider from "@/services/AdminEventHandlersProvider";

export default function Index() {
    return (
        <Router>
            <Routes>
                <Route path="/workspaces" element={<ReduxProvider />}>
                    <Route
                        path=""
                        element={
                            <UserNotificationEventHandlersProvider>
                                <HomePage />
                            </UserNotificationEventHandlersProvider>
                        }
                    />
                    <Route
                        path=":workspaceId/admin"
                        element={
                            <OnlineStatusProvider>
                                <UserNotificationEventHandlersProvider>
                                    <WorkspaceEventHandlersProvider>
                                        <AdminEventHandlersProvider>
                                            <Admin />
                                        </AdminEventHandlersProvider>
                                    </WorkspaceEventHandlersProvider>
                                </UserNotificationEventHandlersProvider>
                            </OnlineStatusProvider>
                        }
                    >
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
                        <Route path="invitations" element={<Invitations />} />
                    </Route>
                    <Route
                        path=":workspaceId"
                        element={
                            <OnlineStatusProvider>
                                <UserNotificationEventHandlersProvider>
                                    <WorkspaceEventHandlersProvider>
                                        <ChannelEventHandlersProvider>
                                            <Layout />
                                        </ChannelEventHandlersProvider>
                                    </WorkspaceEventHandlersProvider>
                                </UserNotificationEventHandlersProvider>
                            </OnlineStatusProvider>
                        }
                    >
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
