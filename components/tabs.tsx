import { FC, ReactNode, useState } from "react";
import { Button2 } from "./button";

export interface TabProps {
  label: string;
  path: string;
  content: ReactNode;
  onSelect?: () => void;
}

export const Tabs: FC<{ tabs: TabProps[] }> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<TabProps>(tabs[0]);
  return (
    <>
      <nav className="mb-3 flex">
        {tabs.map((tab, key) => (
          <Button2
            key={key}
            disabled={activeTab.label === tab.label}
            onClick={() => {
              tab?.onSelect && tab.onSelect();
              setActiveTab(tab);
            }}
            variant="tab"
            active={activeTab.label == tab.label}
          >
            {tab.label}
          </Button2>
        ))}
      </nav>
      {activeTab.content}
    </>
  );
};
