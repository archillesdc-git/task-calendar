"use client";

import { useEffect, useRef } from "react";
import { IoAlarmOutline, IoClose } from "react-icons/io5";

interface AlarmModalProps {
    visible: boolean;
    onClose: () => void;
    message: string;
}

export default function AlarmModal({ visible, onClose, message }: AlarmModalProps) {
    const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const voiceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playAlarmBeep = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            }

            const audioContext = audioContextRef.current;

            const playBeep = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = "sine";

                gainNode.gain.setValueAtTime(0.4, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            // Play alarm pattern
            const now = audioContext.currentTime;
            for (let i = 0; i < 4; i++) {
                playBeep(800, now + i * 0.25, 0.15);
                playBeep(600, now + i * 0.25 + 0.12, 0.1);
            }
        } catch (error) {
            console.error("Could not play alarm sound:", error);
        }
    };

    const speakMessage = (text: string) => {
        if ("speechSynthesis" in window) {
            // Don't cancel - let it finish, but check if already speaking
            if (!window.speechSynthesis.speaking) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 1;
                utterance.lang = "en-US";

                window.speechSynthesis.speak(utterance);
            }
        }
    };

    const stopAllAlarms = () => {
        // Stop alarm loop
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }

        // Stop voice loop
        if (voiceIntervalRef.current) {
            clearInterval(voiceIntervalRef.current);
            voiceIntervalRef.current = null;
        }

        // Stop any ongoing speech
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    useEffect(() => {
        if (visible) {
            // Play immediately
            playAlarmBeep();
            speakMessage(message);

            // Loop alarm sound every 2 seconds
            alarmIntervalRef.current = setInterval(() => {
                playAlarmBeep();
            }, 2000);

            // Loop voice every 5 seconds
            voiceIntervalRef.current = setInterval(() => {
                speakMessage(message);
            }, 5000);
        } else {
            stopAllAlarms();
        }

        return () => {
            stopAllAlarms();
        };
    }, [visible, message]);

    const handleDismiss = () => {
        stopAllAlarms();
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop with pulsing animation */}
            <div
                className="absolute inset-0 bg-black/70 animate-pulse"
                style={{ animationDuration: "1s" }}
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce" style={{ animationDuration: "0.5s", animationIterationCount: "3" }}>
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                    <IoClose size={28} />
                </button>

                {/* Alarm Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-white/20 p-4 rounded-full animate-ping" style={{ animationDuration: "1s" }}>
                        <IoAlarmOutline size={48} color="#fff" />
                    </div>
                </div>

                {/* Alarm Text */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        🔔 ALARM!
                    </h2>
                    <p className="text-xl text-white font-semibold mb-6 drop-shadow">
                        {message}
                    </p>
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="w-full bg-white text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg"
                >
                    ✓ Dismiss Alarm
                </button>
            </div>
        </div>
    );
}
