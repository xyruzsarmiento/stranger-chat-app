"use client";

import { useRef, useState, useCallback } from "react";
// @ts-ignore
import SimplePeer from "simple-peer";

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startLocalStream = useCallback(
    async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setLocalStream(stream);
        return stream;
      } catch (err) {
        console.error("Failed to get user media:", err);
        return null;
      }
    },
    []
  );

  const stopLocalStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  }, []);

  const setLocalAudioEnabled = useCallback((enabled: boolean) => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  const setLocalVideoEnabled = useCallback((enabled: boolean) => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  const createPeer = useCallback(
    (initiator: boolean, stream: MediaStream): SimplePeer.Instance | null => {
      try {
        const p = new SimplePeer({
          initiator,
          stream,
          trickle: true,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });
        peerRef.current = p;
        return p;
      } catch (err) {
        console.error("Failed to create peer:", err);
        return null;
      }
    },
    []
  );

  const signalPeer = useCallback((signal: unknown) => {
    if (peerRef.current) {
      peerRef.current.signal(signal);
    }
  }, []);

  return {
    localStream,
    startLocalStream,
    stopLocalStream,
    setLocalAudioEnabled,
    setLocalVideoEnabled,
    createPeer,
    signalPeer,
  };
}
