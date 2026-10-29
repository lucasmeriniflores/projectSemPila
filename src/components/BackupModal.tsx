import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  HardDrive,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Send,
} from 'lucide-react';
import { AppData } from '../types/finance';
import { exportDataAsJSON, validateAndParseImportJSON } from '../utils/finance';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import {
  loadNotificationConfig,
  saveNotificationConfig,
  requestNotificationPermission,
  sendNotification,
  getRandomMessage,
  NOTIFICATION_PRESETS,
  NotificationPreset,
  NotificationConfig,
} from '../utils/notifications';

interface BackupModalProps {
  appData: AppData;
  isOpen: boolean;
  onClose: () => void;
  onImport: (newData: AppData) => void;
  onReset: () => void;
  animationsEnabled: boolean;
  onToggleAnimations: (enabled: boolean) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  appData,
  isOpen,
  onClose,
  onImport,
  onReset,
  animationsEnabled,
  onToggleAnimations,
}) => {
  const { isRendered, isClosing, handleClose } = useAnimatedModal({
    isOpen,
    onClose,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>(() => loadNotificationConfig());

  const handleToggleNotifications = async () => {
    if (!notifConfig.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setStatusMessage({
          text: 'Permissão de notificação negada no navegador. Habilite nas configurações do seu celular ou navegador.',
          type: 'error',
        });
        return;
      }
      const updated = { ...notifConfig, enabled: true };
      setNotifConfig(updated);
      saveNotificationConfig(updated);
      setStatusMessage({
        text: 'Notificações ativadas! Você receberá 2 lembretes zoeiros por dia (às 10h e às 20h).',
        type: 'success',
      });
    } else {
      const updated = { ...notifConfig, enabled: false };
      setNotifConfig(updated);
      saveNotificationConfig(updated);
      setStatusMessage({
        text: 'Lembretes desativados.',
        type: 'success',
      });
    }
  };

  const handleSelectPreset = (preset: NotificationPreset) => {
    const updated = { ...notifConfig, preset };
    setNotifConfig(updated);
    saveNotificationConfig(updated);
  };

  const handleUpdateTimes = (key: 'morningEnabled' | 'eveningEnabled', value: boolean) => {
    const updated = { ...notifConfig, [key]: value };
    setNotifConfig(updated);
    saveNotificationConfig(updated);
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      setStatusMessage({
        text: 'Permissão de notificação não concedida.',
        type: 'error',
      });
      return;
    }
    const sampleMsg = getRandomMessage(notifConfig.preset, 'morning');
    const sent = await sendNotification('SemPila • Teste de Lembrete 🔔', sampleMsg);
    if (sent) {
      setStatusMessage({
        text: 'Notificação enviada com sucesso! Verifique o topo do seu celular ou computador.',
        type: 'success',
      });
    } else {
      setStatusMessage({
        text: 'Não foi possível disparar a notificação.',
        type: 'error',
      });
    }
  };

  if (!isRendered) return null;

  const totalMonthsCount = Object.keys(appData.months || {}).length;

  const handleExport = () => {
    try {
      const jsonContent = exportDataAsJSON(appData);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `sempila-backup-${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        text: 'Backup exportado com sucesso! Arquivo JSON salvo no dispositivo.',
        type: 'success',
      });
    } catch (e: any) {
      setStatusMessage({
        text: `Erro ao exportar dados: ${e.message}`,
        type: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateAndParseImportJSON(content);

      if (!validation.success || !validation.data) {
        setStatusMessage({
          text: validation.error || 'Arquivo JSON inválido.',
          type: 'error',
        });
        return;
      }

      onImport(validation.data);
      setStatusMessage({
        text: `Dados importados com sucesso! ${Object.keys(validation.data.months).length} meses restaurados.`,
        type: 'success',
      });
    };

    reader.onerror = () => {
      setStatusMessage({
        text: 'Erro ao ler arquivo.',
        type: 'error',
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = () => {
    onReset();
    setShowConfirmReset(false);
    setStatusMessage({
      text: 'O aplicativo foi reiniciado para os dados padrão com sucesso.',
      type: 'success',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto no-scrollbar space-y-4 ${
          isClosing ? 'animate-modal-sheet-out' : 'animate-modal-sheet'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-750 flex items-center justify-center text-zinc-300">
              <Sliders className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-sm font-semibold text-zinc-100 font-display">
                Configurações & Ajustes
              </h2>
              <span className="text-[11px] text-zinc-500">
                Preferências e dados locais
              </span>
            </div>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-accordion ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section 1: Desempenho & Animações */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Desempenho & Fluidez
          </span>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-200 block">
                  Animações suaves
                </span>
                <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                  Desative para respostas instantâneas em celulares mais lentos.
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={animationsEnabled}
              onClick={() => onToggleAnimations(!animationsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                animationsEnabled ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                  animationsEnabled ? 'translate-x-5 bg-zinc-950' : 'translate-x-0 bg-zinc-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section: Notificações & Lembretes Zoeiros */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Lembretes Diários
            </span>
            <span className="text-[10px] text-emerald-400 font-display">
              {notifConfig.enabled ? 'Ativado (10h e 20h)' : 'Desativado'}
            </span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3.5">
            {/* Master Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Notificações diárias
                  </span>
                  <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                    Receba 2 alertas por dia (às 10h e às 20h) para controlar seus gastos.
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifConfig.enabled}
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifConfig.enabled ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                    notifConfig.enabled ? 'translate-x-5 bg-white' : 'translate-x-0 bg-zinc-500'
                  }`}
                />
              </button>
            </div>

            {notifConfig.enabled && (
              <div className="pt-2 border-t border-zinc-850 space-y-3 animate-accordion">
                {/* Presets de Mensagens */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                    Estilo das mensagens zoeiras:
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(Object.keys(NOTIFICATION_PRESETS) as NotificationPreset[]).map((key) => {
                      const item = NOTIFICATION_PRESETS[key];
                      const isSelected = notifConfig.preset === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectPreset(key)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/30'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-100">{item.name}</span>
                            {isSelected && <span className="text-[10px] text-emerald-400 font-medium">Ativo</span>}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{item.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horários Programados: 10:00 e 20:00 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-zinc-300 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" /> Manhã
                      </span>
                      <input
                        type="checkbox"
                        checked={notifConfig.morningEnabled}
                        onChange={(e) => handleUpdateTimes('morningEnabled', e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-100 block font-display">10:00</span>
                    <span className="text-[9px] text-zinc-500 block">Lembrete matinal</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-zinc-300 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-indigo-400" /> Noite
                      </span>
                      <input
                        type="checkbox"
                        checked={notifConfig.eveningEnabled}
                        onChange={(e) => handleUpdateTimes('eveningEnabled', e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-100 block font-display">20:00</span>
                    <span className="text-[9px] text-zinc-500 block">Fechamento do dia</span>
                  </div>
                </div>

                {/* Botão de Testar Notificação Agora */}
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 active:scale-98 border border-zinc-750 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3 h-3 text-emerald-400" />
                  <span>Testar Notificação Agora</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Armazenamento & Cópia de Segurança */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Backup dos Dados
            </span>
            <span className="text-[10px] text-zinc-500 font-display">
              {totalMonthsCount} {totalMonthsCount === 1 ? 'mês salvo' : 'meses salvos'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 active:scale-98 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Exportar Backup (JSON)
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Salvar arquivo com todo o histórico
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
            </button>

            {/* Import */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
                id="json-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 active:scale-98 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">
                      Restaurar Backup (JSON)
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      Importar histórico de arquivo existente
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Informações de Privacidade */}
        <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3 flex items-start gap-2.5 text-zinc-500 text-[11px]">
          <HardDrive className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Seus dados estão gravados exclusivamente na memória local do seu navegador (localStorage). Nenhuma informação financeira é enviada para servidores externos.
          </p>
        </div>

        {/* Section 4: Reiniciar / Limpar */}
        <div className="pt-2 border-t border-zinc-800/80">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2 px-3 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-850 active:scale-98 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Limpar dados ou reiniciar app</span>
            </button>
          ) : (
            <div className="bg-zinc-950 border border-rose-900/40 rounded-xl p-3.5 space-y-2.5 animate-accordion">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-rose-400">
                    Atenção: Reiniciar aplicativo
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Esta ação apagará todos os meses personalizados. Recomendamos baixar um backup antes de prosseguir!
                  </p>
                </div>
              </div>

              {/* Mandatory export option before wiping */}
              <button
                onClick={handleExport}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-300 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Baixar backup antes de limpar</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-750 text-xs font-medium transition cursor-pointer active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  Confirmar e Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Versão bem escondida / discreta do app */}
        <div className="pt-2 text-center">
          <span className="text-[10px] text-zinc-600/70 font-mono tracking-wider select-none">
            SemPila v1.0.2
          </span>
        </div>
      </div>
    </div>
  );
};
