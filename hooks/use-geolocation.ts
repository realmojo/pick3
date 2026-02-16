"use client";

import { useState, useCallback } from "react";
import { Coords } from "@/lib/types";

interface GeolocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "이 브라우저에서는 위치 서비스를 지원하지 않습니다.",
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            x: String(position.coords.longitude),
            y: String(position.coords.latitude),
          },
          loading: false,
          error: null,
        });
      },
      (err) => {
        let message = "위치 정보를 가져올 수 없습니다.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "위치 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.";
        }
        setState({ coords: null, loading: false, error: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분 캐시
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({ coords: null, loading: false, error: null });
  }, []);

  return { ...state, requestLocation, clearLocation };
}
