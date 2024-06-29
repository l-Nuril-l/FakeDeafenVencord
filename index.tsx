import { definePluginSettings } from "@api/Settings";
import { disableStyle, enableStyle } from "@api/Styles";
import ErrorBoundary from "@components/ErrorBoundary";
import { LazyComponent } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import { filters, find } from "@webpack";
import React from "react";

// Manage CSS styles for the plugin
import style from "./style.css?managed";

function mute() {
  (document.querySelector('[aria-label="Mute"]') as HTMLElement).click();
}

function deafen() {
  (document.querySelector('[aria-label="Deafen"]') as HTMLElement).click();
}

const settings = definePluginSettings({
  muteUponFakeDeafen: {
    type: OptionType.BOOLEAN,
    description: "",
    default: false,
  },
  mute: {
    type: OptionType.BOOLEAN,
    description: "",
    default: true,
  },
  deafen: {
    type: OptionType.BOOLEAN,
    description: "",
    default: true,
  },
  cam: {
    type: OptionType.BOOLEAN,
    description: "",
    default: false,
  },
  fakeD: {
    type: OptionType.BOOLEAN,
    description: "",
    default: false,
  },
});

const HeaderBarIcon = LazyComponent(() => {
  const filter = filters.byCode(".HEADER_BAR_BADGE");
  return find((m) => m.Icon && filter(m.Icon)).Icon;
});

function makeIcon() {
  return function () {
    return (
      <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 3a9 9 0 0 0-8.95 10h1.87a5 5 0 0 1 4.1 2.13l1.37 1.97a3.1 3.1 0 0 1-.17 3.78 2.85 2.85 0 0 1-3.55.74 11 11 0 1 1 10.66 0c-1.27.71-2.73.23-3.55-.74a3.1 3.1 0 0 1-.17-3.78l1.38-1.97a5 5 0 0 1 4.1-2.13h1.86A9 9 0 0 0 12 3Z"
        ></path>
        {settings.store.fakeD && <line x1="1" y1="1" x2="23" y2="23" stroke="var(--status-danger)" stroke-width="2"></line>}
      </svg>
    );
  };
}

function FakeVoiceOptionToggleButton() {
  return (
    <HeaderBarIcon
      className="vc-fake-voice-options"
      onClick={() => {
        settings.store.fakeD = !settings.store.fakeD;
        deafen();
        setTimeout(deafen, 250);
        if (settings.store.muteUponFakeDeafen) setTimeout(mute, 300);
      }}
      tooltip={settings.store.fakeD ? "Disable Fake/Deafen Mute" : "Enable Fake/Deafen Mute"}
      icon={makeIcon()}
    />
  );
}

export default definePlugin({
  name: "fake deafen",
  description: "you're deafened but you're not",
  authors: [
    {
      id: 526331463709360141n,
      name: "desu",
    },
  ],
  patches: [
    {
      find: "}voiceStateUpdate(",
      replacement: {
        match: /self_mute:([^,]+),self_deaf:([^,]+),self_video:([^,]+)/,
        replace: "self_mute:$self.toggle($1, 'mute'),self_deaf:$self.toggle($2, 'deaf'),self_video:$self.toggle($3, 'video')",
      },
    },
    {
      find: "toolbar:function",
      replacement: {
        match: /(function \i\(\i\){)(.{1,200}toolbar.{1,100}mobileToolbar)/,
        replace: "$1$self.addIconToToolBar(arguments[0]);$2",
      },
    },
  ],
  settings,
  toggle: (au: any, what: string) => {
    if (settings.store.fakeD === false) return au;
    switch (what) {
      case "mute":
        return settings.store.mute;
      case "deaf":
        return settings.store.deafen;
      case "video":
        return settings.store.cam;
    }
  },
  addIconToToolBar(e: { toolbar: React.ReactNode[] | React.ReactNode }) {
    if (Array.isArray(e.toolbar)) {
      return e.toolbar.push(
        <ErrorBoundary noop={true}>
          <FakeVoiceOptionToggleButton />
        </ErrorBoundary>
      );
    }
    e.toolbar = [
      <ErrorBoundary noop={true}>
        <FakeVoiceOptionToggleButton />
      </ErrorBoundary>,
      e.toolbar,
    ];
  },
  start() {
    enableStyle(style);
  },
  stop() {
    disableStyle(style);
  },
});
