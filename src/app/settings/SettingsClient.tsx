"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  User,
  Moon,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  ChevronRight,
  Sun,
  Clock,
  Target,
  LogOut,
  Bot,
  Sparkles,
  Key,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  AlertCircle,
  Terminal,
  Globe,
  ChevronUp,
  X,
  Download,
  RefreshCw,
  HeartHandshake,
  Info,
} from "lucide-react";
import { createApiKeyAction, revokeApiKeyAction } from "@/lib/apiActions";
import { exportUserData, clearAllUserData } from "@/lib/actions";

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  isSignedIn: boolean;
  initialApiKeys?: ApiKeyItem[];
}

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <div className="rounded-3xl bg-white border border-[#EAE5D8] shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EAE5D8] flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#1A241E]">{title}</h3>
      </div>
      <div className="divide-y divide-[#EAE5D8]">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({ label, description, rightElement, onClick }: SettingsRowProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      className={`w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left ${
        onClick ? "hover:bg-[#FAF8F2] transition-colors cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1A241E]">{label}</p>
        {description && (
          <p className="text-xs text-[#586B60] mt-0.5">{description}</p>
        )}
      </div>
      {rightElement || (onClick && <ChevronRight className="w-4 h-4 text-[#8E9E94] shrink-0" />)}
    </Wrapper>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
        enabled ? "bg-[#1E3127]" : "bg-[#D4CDC3]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsClient({
  userName,
  userEmail,
  userImageUrl,
  isSignedIn,
  initialApiKeys = [],
}: SettingsClientProps) {
  const { signOut } = useAuth();
  const [sleepReminder, setSleepReminder] = useState(true);
  const [taskReminder, setTaskReminder] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load and persist notification reminder preferences
  useEffect(() => {
    try {
      const savedSleep = localStorage.getItem("rooted_settings_sleep_reminder");
      if (savedSleep !== null) setSleepReminder(savedSleep === "true");
      const savedTask = localStorage.getItem("rooted_settings_task_reminder");
      if (savedTask !== null) setTaskReminder(savedTask === "true");
    } catch {}
  }, []);

  const handleToggleSleepReminder = async (enabled: boolean) => {
    setSleepReminder(enabled);
    try {
      localStorage.setItem("rooted_settings_sleep_reminder", String(enabled));
      if (enabled && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      }
    } catch {}
  };

  const handleToggleTaskReminder = async (enabled: boolean) => {
    setTaskReminder(enabled);
    try {
      localStorage.setItem("rooted_settings_task_reminder", String(enabled));
      if (enabled && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      }
    } catch {}
  };

  // ─── Data Privacy & Modals State ───
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearConfirmInput, setClearConfirmInput] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportPayload = await exportUserData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportPayload, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      const todayDate = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `rooted-sanctuary-backup-${todayDate}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearConfirmInput !== "RESET" || isClearing) return;
    try {
      setIsClearing(true);
      await clearAllUserData();
      setIsClearModalOpen(false);
      setClearConfirmInput("");
      window.location.reload();
    } catch (err) {
      console.error("Clear data failed:", err);
    } finally {
      setIsClearing(false);
    }
  };

  // ─── AI Connectors State ───
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(initialApiKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("My AI Assistant");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    id: string;
    name: string;
    rawToken: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"gemini" | "claude" | "grok" | "chatgpt">("gemini");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Public HTTPS host for cloud AI connectors (Gemini, Claude, Grok, ChatGPT require HTTPS)
  const defaultPublicTunnel = "https://adjustments-pursue-centered-squad.trycloudflare.com";
  const [publicHost, setPublicHost] = useState<string>(() => {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin;
    }
    return defaultPublicTunnel;
  });

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      const created = await createApiKeyAction(newKeyName.trim());
      setNewlyCreatedKey({
        id: created.id,
        name: created.name,
        rawToken: created.rawToken,
      });
      setIsGuideOpen(true);
      setApiKeys((prev) => [
        {
          id: created.id,
          name: created.name,
          keyPrefix: created.keyPrefix,
          lastUsedAt: null,
          createdAt: created.createdAt,
        },
        ...prev,
      ]);
      setNewKeyName("My AI Assistant");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create key:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setIsGuideOpen(false);
    setNewlyCreatedKey(null);
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this AI connector? External AIs using this key will immediately lose access.")) {
      return;
    }
    try {
      await revokeApiKeyAction(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      if (newlyCreatedKey?.id === id) {
        setNewlyCreatedKey(null);
      }
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#1A241E]">
          Settings
        </h1>
        <p className="text-sm text-[#586B60]">
          Customize your Rooted experience, preferences, and external AI connectors.
        </p>
      </div>

      {/* ─── Profile Section ─── */}
      <SettingsSection title="Profile" icon={<User className="w-4.5 h-4.5" />}>
        <div className="px-5 py-4 flex items-center gap-4">
          {userImageUrl ? (
            <img
              src={userImageUrl}
              alt={userName}
              className="w-14 h-14 rounded-2xl border-2 border-[#7C9A86]/30 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1E3127] text-[#FAF7F0] flex items-center justify-center font-serif text-xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold text-[#1A241E] truncate">
              {userName}
            </p>
            {userEmail && (
              <p className="text-xs text-[#7C9A86] truncate">{userEmail}</p>
            )}
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#EAF0EC] text-[#3B664B] text-[10px] font-semibold border border-[#7C9A86]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A86]" />
              {isSignedIn ? "Connected" : "Guest Mode"}
            </span>
          </div>
        </div>
      </SettingsSection>

      {/* ─── AI Assistant Connectors (Remote MCP) ─── */}
      <SettingsSection title="AI Assistant Connectors (Remote MCP)" icon={<Bot className="w-4.5 h-4.5" />}>
        <div className="p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1A241E]">Connect Gemini, Claude, Grok & ChatGPT</p>
              <p className="text-xs text-[#586B60] mt-0.5">
                Enable external AI models to view and log habits, tasks, rest rhythms, and milestones in Rooted.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(isGuideOpen || newlyCreatedKey) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsGuideOpen(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE5D8] text-[#586B60] text-xs font-semibold hover:bg-[#FAF8F2] hover:text-[#1A241E] transition-all cursor-pointer shadow-2xs"
                  title="Shrink setup guide"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#586B60]" />
                  <span>Shrink Guide</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setNewlyCreatedKey(null);
                  setIsGuideOpen(true);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Generate Connector Key</span>
              </button>
            </div>
          </div>

          {/* ── Platform Setup Guides & Prompts (Visible on Generate Key / Expand; Shrunk on Page Refresh) ── */}
          {(isGuideOpen || newlyCreatedKey) && (
            <div className="space-y-4 pt-4 border-t border-[#EAE5D8] animate-fade-rise">
              {/* Header inside the guide */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#1E3127] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C9A86]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-[#1A241E]">
                      AI Platform Setup Guides & Prompts
                    </h4>
                    <p className="text-[11px] text-[#586B60]">
                      Follow the platform tabs below to link Rooted with your AI assistant.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuideOpen(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE5D8] text-xs font-medium text-[#586B60] hover:text-[#1A241E] hover:border-[#7C9A86] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  title="Shrink setup guide"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Shrink Guide</span>
                </button>
              </div>

              {/* Active Connector Banner (if just generated) */}
              {newlyCreatedKey && (
            <div className="rounded-2xl p-4 sm:p-5 bg-[#FAF8F2] border border-[#7C9A86]/40 shadow-xs space-y-3 animate-fade-rise">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3B664B]">
                  <Sparkles className="w-4 h-4 text-[#7C9A86]" />
                  <span>New Connector Created: &ldquo;{newlyCreatedKey.name}&rdquo;</span>
                </div>
                <span className="text-[11px] text-[#C87452] font-medium bg-[#F9ECE6] px-2 py-0.5 rounded-md border border-[#D98A6C]/20">
                  Save now · Shown only once
                </span>
              </div>
              <p className="text-xs text-[#586B60]">
                Your fresh MCP connection key is loaded below into the platform instructions. Copy the connection link and follow the steps for your AI platform.
              </p>
            </div>
          )}

          {/* Public Tunnel / Edge Gateway Configurator */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE5D8]">
            <Globe className="w-3.5 h-3.5 text-[#7C9A86] shrink-0" />
            <span className="text-[11px] font-medium text-[#586B60] shrink-0">Public Tunnel Host:</span>
            <input
              type="text"
              value={publicHost}
              onChange={(e) => setPublicHost(e.target.value.trim())}
              placeholder="https://your-tunnel.trycloudflare.com"
              className="flex-1 bg-transparent text-xs font-mono text-[#1A241E] outline-none"
            />
          </div>

          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EAE5D8]/50 rounded-xl overflow-x-auto text-xs font-medium">
            {(["gemini", "claude", "grok", "chatgpt"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-[#1E3127] font-semibold shadow-2xs"
                    : "text-[#586B60] hover:text-[#1A241E]"
                }`}
              >
                {tab === "gemini" ? "Gemini Spark" : tab === "grok" ? "Grok (xAI)" : tab}
              </button>
            ))}
          </div>

          {/* Platform Details & Instructions */}
          {activeTab === "gemini" && (
            <div className="space-y-4">
              {/* Card 1: To integrate Rooted to Gemini */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E3127] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                        To integrate Rooted to Gemini
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Connect Rooted as an MCP Custom App inside your Google Gemini account.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/20">
                    Setup Guide
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Open Gemini in the browser
                      </p>
                      <p className="text-[11px] text-[#7C9A86] mt-0.5 flex items-center gap-1">
                        Visit{" "}
                        <a
                          href="https://gemini.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E3127] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-[#3B664B]"
                        >
                          gemini.google.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {" "}and sign in with your Google Account.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <p className="font-semibold text-[#1A241E]">
                        Click on Setting &gt; Personal Intelligence &gt; Connected Apps &gt; Add Custom Apps
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          ⚙ Settings
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          Personal Intelligence
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          Connected Apps
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF0EC] border border-[#7C9A86]/30 font-semibold text-[#1E3127]">
                          + Add Custom Apps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-[#1A241E]">
                        Paste the key on the MCP Server URL and click on next and connect
                      </p>

                      {/* MCP URL Copy Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={
                              newlyCreatedKey?.rawToken
                                ? `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`
                                : `${publicHost}/api/mcp?token=${apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}...` : "YOUR_CONNECTOR_TOKEN"}`
                            }
                            className="flex-1 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1A241E] select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newlyCreatedKey?.rawToken) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`,
                                  "gemini"
                                );
                              } else if (apiKeys.length > 0) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${apiKeys[0].keyPrefix}`,
                                  "gemini"
                                );
                              } else {
                                setIsModalOpen(true);
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#1E3127] text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#2A3F34] transition-colors cursor-pointer shrink-0 shadow-xs"
                          >
                            {copiedKey === "gemini" ? (
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedKey === "gemini"
                                ? "Copied!"
                                : newlyCreatedKey?.rawToken
                                ? "Copy MCP URL"
                                : apiKeys.length > 0
                                ? "Copy Key URL"
                                : "Generate Key to Copy"}
                            </span>
                          </button>
                        </div>

                        {/* Pro-Tips Callout */}
                        <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-[11px] text-[#586B60] space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1A241E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A86]" />
                            <span>Important Connection Details:</span>
                          </div>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Client ID &amp; Client secret</strong>: Leave both fields <strong>empty</strong>. Rooted validates directly using your secure URL token.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Server Name</strong>: Enter <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE5D8] font-mono text-[#1E3127]">Rooted Sanctuary MCP Server</code> when prompted.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • Click <strong>Next</strong> and <strong>Connect</strong> (or <strong>Save</strong>) to finish the connection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: To use on Gemini */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F7F4] border border-[#7C9A86]/30 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#3B664B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1E3127]">
                        To use on Gemini
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Interact with your sanctuary, habits, sleep, and tasks inside Gemini Spark.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white text-[#3B664B] border border-[#7C9A86]/20">
                    Workflow &amp; Usage
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1: Switch to Spark Tab */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Switch to the Spark tab in Gemini
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        In the left sidebar of Gemini, click on the <strong>Spark</strong> tab. Custom MCP connected apps are active specifically inside Spark conversations.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Mention @Rooted Sanctuary MCP Server */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Mention Rooted with <code className="px-1.5 py-0.5 rounded bg-white border border-[#7C9A86]/30 font-mono text-[#1E3127] font-semibold">@</code>
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        Type <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE5D8] font-mono text-[#1E3127] font-semibold">@</code> in the prompt bar and select <strong>Rooted Sanctuary MCP Server</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Grant Permission ("Allow") */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Click &ldquo;Allow&rdquo; on first tool run
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        When Gemini asks <em>&ldquo;Let Gemini use [action] from Rooted Sanctuary MCP Server&rdquo;</em>, click <strong>Allow</strong> to give Gemini permission to query your data.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Ask anything about your day */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Manage your daily sanctuary conversationally
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        You can ask Gemini to check your Harmony score, list uncompleted habits, plant new daily intentions, shift overdue tasks, or review your milestones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "claude" && (
            <div className="space-y-4">
              {/* Card 1: To integrate Rooted to Claude */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E3127] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                        To integrate Rooted to Claude (Anthropic)
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Connect Rooted to Claude.ai or Claude Desktop via modern Streamable HTTP.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/20">
                    Setup Guide
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Open Claude Connectors Settings
                      </p>
                      <p className="text-[11px] text-[#7C9A86] mt-0.5 flex items-center gap-1">
                        Go to{" "}
                        <a
                          href="https://claude.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E3127] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-[#3B664B]"
                        >
                          claude.ai
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {" "}and click <strong>Settings (⚙) &gt; Connectors</strong>, then click <strong>Add custom connector</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <p className="font-semibold text-[#1A241E]">
                        Set Connector Name to &ldquo;Rooted&rdquo;
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value="Rooted"
                          className="bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3 py-1.5 text-xs font-mono text-[#1A241E] w-36 select-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard("Rooted", "claude-name")}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#EAE5D8] text-[11px] text-[#586B60] hover:text-[#1E3127] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          {copiedKey === "claude-name" ? <Check className="w-3 h-3 text-[#3B664B]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === "claude-name" ? "Copied" : "Copy Name"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-[#1A241E]">
                        Paste the Server URL into Claude
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={
                              newlyCreatedKey?.rawToken
                                ? `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`
                                : `${publicHost}/api/mcp?token=${apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}...` : "YOUR_CONNECTOR_TOKEN"}`
                            }
                            className="flex-1 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1A241E] select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newlyCreatedKey?.rawToken) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`,
                                  "claude"
                                );
                              } else if (apiKeys.length > 0) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${apiKeys[0].keyPrefix}`,
                                  "claude"
                                );
                              } else {
                                setIsModalOpen(true);
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#1E3127] text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#2A3F34] transition-colors cursor-pointer shrink-0 shadow-xs"
                          >
                            {copiedKey === "claude" ? (
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedKey === "claude"
                                ? "Copied!"
                                : newlyCreatedKey?.rawToken
                                ? "Copy Streamable HTTP URL"
                                : apiKeys.length > 0
                                ? "Copy URL"
                                : "Generate Key to Copy"}
                            </span>
                          </button>
                        </div>

                        {/* Pro-Tips Callout */}
                        <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-[11px] text-[#586B60] space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1A241E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A86]" />
                            <span>Claude Connection Notes:</span>
                          </div>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Streamable HTTP</strong>: Use <code className="bg-white px-1 py-0.5 rounded border border-[#EAE5D8] font-mono text-[#1E3127]">/api/mcp</code> (without <code className="font-mono text-[#C87452]">/sse</code>). This uses Claude&apos;s modern streamable HTTP standard and eliminates deprecation warnings.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Authentication</strong>: No separate login required; your private token is embedded in the URL query string.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Manual Configuration / Continue Anyway</strong>: If Claude shows <em>&ldquo;Continue anyway&rdquo;</em>, click it and select transport <strong>HTTP</strong> (or Streamable HTTP).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: To use on Claude */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F7F4] border border-[#7C9A86]/30 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#3B664B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1E3127]">
                        To use on Claude
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Use Rooted tools directly inside any chat conversation on Claude.ai or Claude Desktop.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white text-[#3B664B] border border-[#7C9A86]/20">
                    Workflow &amp; Usage
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Connectors are Active in All Chats
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        Once saved, Claude automatically enables Rooted Sanctuary tools in your chat sessions. Look for the connector icon near the chat bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Speak Naturally to Manage Your Day
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        Claude can query your current Harmony score, list today&apos;s habits and streaks, plant new intentions, check off tasks, and reschedule overdue items.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Prompts for Claude */}
                <div className="pt-2 border-t border-[#7C9A86]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#1E3127] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3B664B]" />
                      <span>Quick Prompts for Claude (Click to Copy)</span>
                    </p>
                    <span className="text-[10px] text-[#7C9A86]">1-click copy</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        title: "📊 Daily Sanctuary Summary",
                        desc: "Get today's harmony score, active habits, and tasks",
                        prompt: "Check my Rooted Sanctuary status and give me a full summary of today's Harmony score, pending intentions, and habit streaks.",
                      },
                      {
                        title: "🧹 Shift Overdue Intentions",
                        desc: "Roll forward overdue tasks to today",
                        prompt: "Use Rooted reschedule_overdue_tasks to move all my overdue tasks to today.",
                      },
                      {
                        title: "🌱 Plant a New Priority",
                        desc: "Create a new daily intention",
                        prompt: "Plant a new intention in Rooted titled 'Complete Report' under Career for today.",
                      },
                      {
                        title: "✅ Check Off a Habit",
                        desc: "Log a habit completion for today",
                        prompt: "Mark my 'Read a Book' habit as completed for today in Rooted.",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyToClipboard(item.prompt, `claude-prompt-${idx}`)}
                        className="group p-3 rounded-xl bg-white border border-[#EAE5D8] hover:border-[#7C9A86] hover:bg-[#FAF8F2] transition-all cursor-pointer space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#1A241E] group-hover:text-[#3B664B] transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-[#7C9A86] font-medium flex items-center gap-1">
                            {copiedKey === `claude-prompt-${idx}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#3B664B]" />
                                <span className="text-[#3B664B] font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#8E9E94] group-hover:text-[#3B664B]" />
                                <span className="group-hover:text-[#3B664B]">Copy</span>
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#586B60]">
                          {item.desc}
                        </p>
                        <div className="p-1.5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8]/70 text-[10px] font-mono text-[#1E3127] line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "grok" && (
            <div className="space-y-4">
              {/* Card 1: To integrate Rooted to Grok */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E3127] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                        To integrate Rooted to Grok (xAI)
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Connect Rooted to xAI Grok as a custom MCP connector.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/20">
                    Setup Guide
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Open Grok in the browser
                      </p>
                      <p className="text-[11px] text-[#7C9A86] mt-0.5 flex items-center gap-1">
                        Visit{" "}
                        <a
                          href="https://grok.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E3127] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-[#3B664B]"
                        >
                          grok.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {" "}or x.com and sign in to your xAI account.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <p className="font-semibold text-[#1A241E]">
                        Click on Plugins &gt; New Connector &gt; Custom
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          Plugins
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          New Connector
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EAE5D8] font-medium text-[#1A241E]">
                          Custom
                        </span>
                        <span className="text-[#8E9E94]">&gt;</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF0EC] border border-[#7C9A86]/30 font-semibold text-[#1E3127]">
                          + Add Connector
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 space-y-2.5">
                      <p className="font-semibold text-[#1A241E]">
                        Paste the MCP URL, set the name, and click Add Connector
                      </p>

                      {/* Set Name Bar */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#586B60] uppercase tracking-wider">
                          Connector Name:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value="Rooted"
                            className="bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3 py-1.5 text-xs font-mono text-[#1A241E] w-36 select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard("Rooted", "grok-name")}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#EAE5D8] text-[11px] text-[#586B60] hover:text-[#1E3127] transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            {copiedKey === "grok-name" ? <Check className="w-3 h-3 text-[#3B664B]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === "grok-name" ? "Copied" : "Copy Name"}</span>
                          </button>
                        </div>
                      </div>

                      {/* MCP URL Bar */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#586B60] uppercase tracking-wider">
                          MCP Server URL:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={
                              newlyCreatedKey?.rawToken
                                ? `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`
                                : `${publicHost}/api/mcp?token=${apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}...` : "YOUR_CONNECTOR_TOKEN"}`
                            }
                            className="flex-1 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1A241E] select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newlyCreatedKey?.rawToken) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${newlyCreatedKey.rawToken}`,
                                  "grok"
                                );
                              } else if (apiKeys.length > 0) {
                                copyToClipboard(
                                  `${publicHost}/api/mcp?token=${apiKeys[0].keyPrefix}`,
                                  "grok"
                                );
                              } else {
                                setIsModalOpen(true);
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#1E3127] text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#2A3F34] transition-colors cursor-pointer shrink-0 shadow-xs"
                          >
                            {copiedKey === "grok" ? (
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedKey === "grok"
                                ? "Copied!"
                                : newlyCreatedKey?.rawToken
                                ? "Copy MCP URL"
                                : apiKeys.length > 0
                                ? "Copy Key URL"
                                : "Generate Key to Copy"}
                            </span>
                          </button>
                        </div>

                        {/* Pro-Tips Callout */}
                        <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-[11px] text-[#586B60] space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1A241E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A86]" />
                            <span>Grok Connection Details:</span>
                          </div>
                          <p className="pl-3 leading-relaxed">
                            • <strong>Name Field</strong>: Set to <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE5D8] font-mono text-[#1E3127]">Rooted</code> so you can easily mention it with <code className="font-semibold text-[#1E3127]">@Rooted</code> in conversations.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • <strong>MCP URL Field</strong>: Paste the URL above. Rooted validates your access token automatically via the URL parameter.
                          </p>
                          <p className="pl-3 leading-relaxed">
                            • Click <strong>Add Connector</strong> to save and activate the connector.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: To use on Grok */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F7F4] border border-[#7C9A86]/30 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#3B664B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1E3127]">
                        To use on Grok
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        In Grok, talking with Rooted is simple — just use @ with the set name.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white text-[#3B664B] border border-[#7C9A86]/20">
                    Workflow &amp; Usage
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Mention Rooted with <code className="px-1.5 py-0.5 rounded bg-white border border-[#7C9A86]/30 font-mono text-[#1E3127] font-semibold">@</code>
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        In any Grok chat prompt, simply type <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE5D8] font-mono text-[#1E3127] font-semibold">@Rooted</code> (or whatever name you set) to invoke your sanctuary connector.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-white border border-[#7C9A86]/30 flex items-center justify-center text-xs text-[#3B664B] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-[#1E3127]">
                        Manage Your Sanctuary Conversationally
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5 leading-relaxed">
                        Grok will call Rooted&apos;s tools live to report your Harmony score, check off habits, reschedule overdue tasks, or plant new daily intentions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chatgpt" && (
            <div className="space-y-4">
              {/* Card 1: To integrate Rooted to ChatGPT */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E3127] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                        To integrate Rooted to ChatGPT
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Connect Rooted as an MCP Custom App / Plugin inside ChatGPT.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EAF0EC] text-[#3B664B] border border-[#7C9A86]/20">
                    Setup Guide
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Open the &ldquo;New Plugin&rdquo; dialog in ChatGPT
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5">
                        In ChatGPT, open your developer/plugins panel and click <strong>Create a plugin / Add MCP connector</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-[#1A241E]">
                        Set Name & Connection Mode
                      </p>
                      <p className="text-[11px] text-[#586B60]">
                        Set <strong>Name</strong> to <code className="bg-[#FAF8F2] px-1.5 py-0.5 rounded border border-[#EAE5D8] text-[#1E3127] font-semibold">Rooted Sanctuary</code> and keep <strong>Connection</strong> selected on <code className="bg-[#FAF8F2] px-1.5 py-0.5 rounded border border-[#EAE5D8] text-[#1E3127] font-semibold">Server URL</code>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-[#1A241E]">
                        Paste your Server URL
                      </p>

                      {/* Server URL Copy Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={
                              newlyCreatedKey?.rawToken
                                ? `${publicHost}/api/mcp/sse?token=${newlyCreatedKey.rawToken}`
                                : `${publicHost}/api/mcp/sse?token=rooted_pat_7e26adac31ae855c8a3b6ea3e70b0b950b535dd7481e36f3`
                            }
                            className="flex-1 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1A241E] select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const url = newlyCreatedKey?.rawToken
                                ? `${publicHost}/api/mcp/sse?token=${newlyCreatedKey.rawToken}`
                                : `${publicHost}/api/mcp/sse?token=rooted_pat_7e26adac31ae855c8a3b6ea3e70b0b950b535dd7481e36f3`;
                              copyToClipboard(url, "chatgpt");
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#1E3127] text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#2A3F34] transition-colors cursor-pointer shrink-0 shadow-xs"
                          >
                            {copiedKey === "chatgpt" ? (
                              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedKey === "chatgpt" ? "Copied!" : "Copy Server URL"}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#7C9A86]">
                          ✓ Copy and paste this exact link into the <strong>Server URL</strong> input box.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Critical Authentication Warning */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Switch Authentication from &ldquo;OAuth&rdquo; to &ldquo;None&rdquo;
                      </p>
                      <div className="mt-1.5 p-2.5 rounded-xl bg-[#FBF7F0] border border-[#D98A6C]/30 text-[11px] text-[#8C4A2F] space-y-1">
                        <p className="font-semibold">⚠️ Crucial Setting:</p>
                        <p className="leading-relaxed">
                          By default, ChatGPT selects <strong>OAuth</strong>. Because Rooted uses secure URL tokens, click the Authentication dropdown and change it to <strong>None</strong> (or <em>No Auth</em>).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      5
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Check &ldquo;I understand and want to continue&rdquo; and click Create
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5">
                        Check the security acknowledgement box and click <strong>Create</strong> to register Rooted Sanctuary in ChatGPT.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: To use on ChatGPT */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E3127] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                        To use on ChatGPT
                      </h4>
                      <p className="text-[11px] text-[#586B60]">
                        Interact with your habits, intentions, and rest rhythm in conversations.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAF0EB] text-[#C87452] border border-[#D98A6C]/20">
                    Workflow & Usage
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Enable Rooted Sanctuary in your chat
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5">
                        Ensure <strong>Rooted Sanctuary</strong> is enabled in your chat tools or plugins selector.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#586B60]">
                    <span className="w-5 h-5 rounded-lg bg-[#FAF8F2] border border-[#EAE5D8] flex items-center justify-center text-xs text-[#1E3127] font-semibold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A241E]">
                        Manage your sanctuary conversationally
                      </p>
                      <p className="text-[11px] text-[#586B60] mt-0.5">
                        Ask ChatGPT to retrieve your Harmony score, check off habits, reschedule overdue tasks, or plant intentions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Separate Section: Quick Prompts & Commands (Click to Copy) ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE5D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#1E3127] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#7C9A86]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1A241E]">
                    Quick Prompts for Gemini Spark (Click to Copy)
                  </h4>
                  <p className="text-[11px] text-[#586B60]">
                    Ready-to-use prompts to interact with your habits, intentions, and sanctuary across Gemini Spark, Claude, Grok, or ChatGPT.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#3B664B] bg-[#EAF0EC] px-2.5 py-1 rounded-full border border-[#7C9A86]/20">
                1-Click Copy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  title: "📊 Daily Sanctuary Briefing",
                  desc: "Get full breakdown of Harmony score, habits, and rest",
                  prompt: "@Rooted Sanctuary MCP Server call get_today_sanctuary and give me a full breakdown of my day, Harmony score, and habits.",
                },
                {
                  title: "🧹 Reschedule Overdue Tasks",
                  desc: "Move all unfinished past tasks forward to today",
                  prompt: "@Rooted Sanctuary MCP Server call reschedule_overdue_tasks to shift all my overdue tasks to today.",
                },
                {
                  title: "🌱 Plant a New Intention",
                  desc: "Add a new daily priority to your sanctuary",
                  prompt: "@Rooted Sanctuary MCP Server call create_intention to plant a new intention titled 'Focus Work' under Craft for today.",
                },
                {
                  title: "✅ Check Off a Habit",
                  desc: "Mark a habit completed for today's streak",
                  prompt: "@Rooted Sanctuary MCP Server call log_habit to mark 'Read a Book' as completed for today.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => copyToClipboard(item.prompt, `quick-prompt-${idx}`)}
                  className="group p-3.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] hover:border-[#7C9A86] hover:bg-white transition-all cursor-pointer space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A241E] group-hover:text-[#3B664B] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#7C9A86] font-medium flex items-center gap-1">
                      {copiedKey === `quick-prompt-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#3B664B]" />
                          <span className="text-[#3B664B] font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#8E9E94] group-hover:text-[#3B664B]" />
                          <span className="group-hover:text-[#3B664B]">Copy</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#586B60]">
                    {item.desc}
                  </p>
                  <div className="p-2 rounded-lg bg-white border border-[#EAE5D8]/70 text-[10px] font-mono text-[#1E3127] line-clamp-2 leading-relaxed group-hover:border-[#7C9A86]/40 transition-colors">
                    {item.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Shrink Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsGuideOpen(false);
                setNewlyCreatedKey(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EAE5D8] text-xs font-medium text-[#586B60] hover:text-[#1A241E] hover:border-[#7C9A86] transition-all cursor-pointer shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Shrink Guide</span>
            </button>
          </div>
        </div>
      )}

          {/* Active Connectors List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#1A241E] uppercase tracking-wider">Active Connectors</p>
            {apiKeys.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-dashed border-[#EAE5D8] text-center">
                <p className="text-xs text-[#586B60]">
                  No AI connectors configured yet. Click <strong>Generate Connector Key</strong> above to link Claude, Gemini, Grok, or ChatGPT.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE5D8] border border-[#EAE5D8] rounded-2xl overflow-hidden bg-white">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A241E] truncate">{key.name}</p>
                      <p className="text-[11px] font-mono text-[#8E9E94]">{key.keyPrefix}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-[#586B60]">
                        {key.lastUsedAt ? "Active recently" : "Never used"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-1.5 rounded-lg text-[#C87452] hover:bg-[#F9ECE6] transition-colors cursor-pointer"
                        title="Disconnect Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Localhost Testing Help Note */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8] flex items-start gap-2.5 text-xs text-[#586B60]">
            <Terminal className="w-4 h-4 text-[#7C9A86] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-[#1A241E]">Testing locally with Cloud AIs?</p>
              <p className="text-[11px] leading-relaxed">
                Cloud AIs (like <code>claude.ai</code> or <code>gemini.google.com</code>) cannot directly reach <code>localhost</code> on your computer.
                Run a free tunnel in terminal: <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE5D8] text-[#1E3127]">npx cloudflared tunnel --url http://localhost:3000</code> and replace the host in your connector URL with your tunnel address.
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Modal: Create Key */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelModal();
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-[#EAE5D8] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1E3127] text-white flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A241E]">New AI Connector</h3>
                  <p className="text-xs text-[#586B60]">Create an access key for Claude, Gemini, Grok, or ChatGPT.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelModal}
                className="p-1.5 rounded-lg text-[#586B60] hover:text-[#1A241E] hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A241E] mb-1">
                  Connector Label
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Claude Desktop, Gemini Spark"
                  className="w-full rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] px-3.5 py-2 text-sm text-[#1A241E] focus:outline-none focus:ring-2 focus:ring-[#7C9A86]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#586B60] hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !newKeyName.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1E3127] text-white text-xs font-semibold hover:bg-[#2A3F34] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Sleep & Rest ─── */}
      <SettingsSection title="Sleep & Rest" icon={<Moon className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Default Sleep Target"
          description="Your baseline daily rest goal (adjustable per-session)"
          rightElement={
            <span className="px-3 py-1 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-sm font-serif font-bold text-[#1A241E]">
              8.0h
            </span>
          }
        />
        <SettingsRow
          label="Preferred Bedtime"
          description="Suggested bedtime for your rest rhythm"
          rightElement={
            <div className="flex items-center gap-1.5 text-sm text-[#586B60]">
              <Clock className="w-3.5 h-3.5" />
              <span>11:00 PM</span>
            </div>
          }
        />
        <SettingsRow
          label="Preferred Wake Time"
          description="When you ideally want to rise"
          rightElement={
            <div className="flex items-center gap-1.5 text-sm text-[#586B60]">
              <Sun className="w-3.5 h-3.5" />
              <span>7:00 AM</span>
            </div>
          }
        />
      </SettingsSection>

      {/* ─── Notifications ─── */}
      <SettingsSection title="Notifications" icon={<Bell className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Morning Sleep Check-in"
          description="Remind you to log your rest each morning"
          rightElement={
            <ToggleSwitch enabled={sleepReminder} onChange={handleToggleSleepReminder} />
          }
        />
        <SettingsRow
          label="Daily Task Reminder"
          description="Nudge for uncompleted daily intentions"
          rightElement={
            <ToggleSwitch enabled={taskReminder} onChange={handleToggleTaskReminder} />
          }
        />
      </SettingsSection>

      {/* ─── Appearance ─── */}
      <SettingsSection title="Appearance" icon={<Palette className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Dark Mode"
          description="Switch to a darker interface (coming soon)"
          rightElement={
            <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
          }
        />
        <SettingsRow
          label="Compact View"
          description="Reduce spacing for denser layouts"
          rightElement={
            <span className="px-2 py-0.5 rounded-lg bg-[#EFEAE0] text-[10px] font-semibold text-[#586B60] border border-[#E4DDD0]">
              Coming Soon
            </span>
          }
        />
      </SettingsSection>

      {/* ─── Goals & Tracking ─── */}
      <SettingsSection title="Goals & Tracking" icon={<Target className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Week Starts On"
          description="Configure your week start day"
          rightElement={
            <span className="text-sm font-medium text-[#586B60]">Monday</span>
          }
        />
        <SettingsRow
          label="Harmony Score Formula"
          description="How your daily harmony (0–100%) is calculated across habits, tasks, and rest"
          rightElement={
            <span className="text-xs text-[#7C9A86] font-semibold hover:underline cursor-pointer">
              View Formula
            </span>
          }
          onClick={() => setIsFormulaModalOpen(true)}
        />
      </SettingsSection>

      {/* ─── Privacy & Data ─── */}
      <SettingsSection title="Privacy & Data" icon={<Shield className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Export My Data"
          description="Download all your tasks, habits, sleep logs, milestones, and notes as JSON"
          rightElement={
            isExporting ? (
              <span className="flex items-center gap-1.5 text-xs text-[#7C9A86] font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </span>
            ) : exportSuccess ? (
              <span className="flex items-center gap-1 text-xs text-[#3B664B] font-semibold bg-[#EAF0EC] px-2.5 py-1 rounded-full border border-[#7C9A86]/20">
                <Check className="w-3.5 h-3.5" />
                <span>Exported</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-[#1E3127] font-semibold bg-[#FAF8F2] px-3 py-1 rounded-xl border border-[#EAE5D8] hover:bg-[#F2ECE1] transition-colors">
                <Download className="w-3.5 h-3.5 text-[#7C9A86]" />
                <span>Download JSON</span>
              </span>
            )
          }
          onClick={handleExportData}
        />
        <SettingsRow
          label="Clear All Data"
          description="Permanently delete all your Rooted data and restore a clean slate"
          rightElement={
            <span className="text-xs text-[#D98A6C] font-semibold hover:underline cursor-pointer">
              Reset Sanctuary
            </span>
          }
          onClick={() => setIsClearModalOpen(true)}
        />
      </SettingsSection>

      {/* ─── About ─── */}
      <SettingsSection title="About" icon={<HelpCircle className="w-4.5 h-4.5" />}>
        <SettingsRow
          label="Version"
          description="Rooted v1.0.0 — Grounded Edition"
          rightElement={
            <span className="text-xs text-[#8E9E94]">v1.0.0</span>
          }
        />
        <SettingsRow
          label="Feedback & Support"
          description="Share thoughts, report friction, or suggest ideas to help Rooted grow"
          rightElement={
            <span className="text-xs text-[#7C9A86] font-semibold hover:underline cursor-pointer">
              Contact & Feedback
            </span>
          }
          onClick={() => setIsFeedbackModalOpen(true)}
        />
      </SettingsSection>

      {/* ─── Sign Out ─── */}
      {isSignedIn && (
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#F9ECE6] hover:bg-[#F2DCD0] border border-[#D98A6C]/30 text-[#C87452] font-semibold text-sm transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out of Rooted</span>
        </button>
      )}

      {/* Modal: Clear All Data Confirmation */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] rounded-3xl w-full max-w-md border border-[#EAE5D8] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-[#59271E] p-6 text-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#733428] flex items-center justify-center text-[#FAF7F0]">
                  <AlertCircle className="w-5 h-5 text-[#F2C2BA]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-[#FAF7F0]">
                    Reset Sanctuary
                  </h3>
                  <p className="text-xs text-[#F2C2BA] mt-0.5">
                    Permanent action — cannot be undone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsClearModalOpen(false);
                  setClearConfirmInput("");
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#F2C2BA] hover:text-[#FAF7F0] hover:bg-[#733428] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClearDataSubmit} className="p-6 space-y-4">
              <p className="text-xs text-[#586B60] leading-relaxed">
                This will permanently delete all your <strong className="text-[#1A241E]">daily intentions</strong>, <strong className="text-[#1A241E]">habit logs & streaks</strong>, <strong className="text-[#1A241E]">sleep rest records</strong>, <strong className="text-[#1A241E]">life goals & milestones</strong>, and <strong className="text-[#1A241E]">field notes</strong>.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FDF5F3] border border-[#F2C2BA] text-xs text-[#8A3222] space-y-1">
                <p className="font-bold">Confirmation Required</p>
                <p>Type <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-[#F2C2BA]">RESET</code> below to confirm permanent deletion.</p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Type RESET"
                  value={clearConfirmInput}
                  onChange={(e) => setClearConfirmInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EAE5D8] text-sm font-semibold text-[#1A241E] focus:outline-hidden focus:ring-2 focus:ring-[#D98A6C]"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsClearModalOpen(false);
                    setClearConfirmInput("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#586B60] hover:text-[#1A241E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clearConfirmInput !== "RESET" || isClearing}
                  className="px-5 py-2.5 rounded-xl bg-[#8A3222] hover:bg-[#A33B29] text-[#FAF7F0] text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {isClearing ? "Resetting..." : "Permanently Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Harmony Score Formula */}
      {isFormulaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] rounded-3xl w-full max-w-lg border border-[#EAE5D8] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-[#1E3127] p-6 text-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2A3F34] flex items-center justify-center text-[#7C9A86]">
                  <Sparkles className="w-5 h-5 text-[#D4A373]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-[#FAF7F0]">
                    The Harmony Formula
                  </h3>
                  <p className="text-xs text-[#8FA697] mt-0.5">
                    Conscious Life Rhythm Architecture
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormulaModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8FA697] hover:text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-[#586B60] leading-relaxed">
                Rooted does not score you on frantic busywork. The <strong>Daily Harmony Score (0–100%)</strong> measures balanced cohesion across your three primary pillars:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#1E3127]">🌿 40% — Ritual Growth (Habits)</span>
                    <span className="text-xs font-mono font-bold text-[#7C9A86]">0.40 Weight</span>
                  </div>
                  <p className="text-xs text-[#586B60] leading-relaxed">
                    Evaluates consistency of daily rituals completed today plus your rolling 7-day adherence rate.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#1E3127]">📋 40% — Daily Intentions (Tasks)</span>
                    <span className="text-xs font-mono font-bold text-[#D98A6C]">0.40 Weight</span>
                  </div>
                  <p className="text-xs text-[#586B60] leading-relaxed">
                    Ratio of intentions fulfilled strictly within today&apos;s conscious horizon (completed vs total scheduled).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#1E3127]">🌙 20% — Rest Sanctuary (Sleep)</span>
                    <span className="text-xs font-mono font-bold text-[#3D637E]">0.20 Weight</span>
                  </div>
                  <p className="text-xs text-[#586B60] leading-relaxed">
                    Reflects sleep consistency against your baseline target (8.0h default), granting optimal vitality within ±30 minutes.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EAF0EC] border border-[#7C9A86]/30 text-xs text-[#3B664B] flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#7C9A86]" />
                <p className="leading-relaxed">
                  <strong>Days Rooted Bonus:</strong> Sustaining consecutive check-in streaks acts as soil nutrition, stabilizing your score against occasional missed days.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer shadow-xs"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Feedback & Support */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] rounded-3xl w-full max-w-md border border-[#EAE5D8] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-[#1E3127] p-6 text-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2A3F34] flex items-center justify-center text-[#7C9A86]">
                  <HeartHandshake className="w-5 h-5 text-[#D4A373]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight text-[#FAF7F0]">
                    Feedback & Sanctuary Support
                  </h3>
                  <p className="text-xs text-[#8FA697] mt-0.5">
                    Help Rooted flourish and grow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8FA697] hover:text-[#FAF7F0] hover:bg-[#2A3F34] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#586B60] leading-relaxed">
                Rooted was designed to bring peace, intentionality, and rhythm to daily life. Whether you have ideas for new features, found a friction point, or simply want to say hello:
              </p>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A241E]">Direct Contact</p>
                    <p className="text-xs text-[#586B60] truncate">samamakarim092@gmail.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText("samamakarim092@gmail.com");
                        alert("Email address copied to clipboard!");
                      } catch {}
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-xs font-semibold text-[#1E3127] hover:bg-[#F2ECE1] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7C9A86]" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#EAE5D8] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1A241E]">Project Repository</p>
                    <p className="text-xs text-[#586B60]">GitHub · The Rooted Project</p>
                  </div>
                  <a
                    href="https://github.com/SamamaKarim092/the-rooted-project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#1E3127] text-white text-xs font-semibold hover:bg-[#2A3F34] transition-colors flex items-center gap-1.5"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3 h-3 text-[#D4A373]" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] text-[#1A241E] text-xs font-semibold hover:bg-[#F2ECE1] transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-6" />
    </div>
  );
}
