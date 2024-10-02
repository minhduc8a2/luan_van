import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatArea from "./ChatArea/ChatArea";
import BrowseFiles from "./BrowseFiles/BrowseFiles";
import BrowseChannels from "./BrowseChannels/BrowseChannels";
import BrowseUsers from "./BrowseUsers/BrowseUsers";
import Layout from "./Layout";
export default function Index() {
    return (
        <Router>
            <Routes>
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
