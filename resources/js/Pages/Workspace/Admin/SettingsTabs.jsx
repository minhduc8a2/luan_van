import React, { createContext, useContext, useState } from "react";

const SettingsTabsContext = createContext(null);
function SettingsTabs({ tabs, contents }) {
    const [tabIndex, setTabIndex] = useState(0);
    return (
        <SettingsTabsContext.Provider
            value={{ currentTabIndex: tabIndex, setTabIndex }}
        >
            <div className="flex mt-4">
                {tabs.map((tab, i) => (
                    <TabItem tabIndex={i} key={i}>
                        {tab}
                    </TabItem>
                ))}
            </div>
            <div className="bg-color-contrast w-3/4  border border-color/15 p-8">
                {contents.map((content, i) => {
                    return tabIndex == i && <div key={i}>{content}</div>;
                })}
            </div>
        </SettingsTabsContext.Provider>
    );
}
function TabItem({ tabIndex, children }) {
    const { currentTabIndex, setTabIndex } = useContext(SettingsTabsContext);
    return (
        <button
            onClick={() => setTabIndex(tabIndex)}
            className={`${
                tabIndex == currentTabIndex
                    ? "text-color-high-emphasis border border-color/15 border-b-color-contrast bg-color-contrast "
                    : "text-link"
            } font-semibold p-4 text-lg relative -mb-[1px]`}
        >
            {children}
        </button>
    );
}

SettingsTabs.TabItem = TabItem;

export default SettingsTabs;
