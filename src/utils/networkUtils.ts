import * as Network from "expo-network";

export const isOnline = async (): Promise<boolean> => {
  const state = await Network.getNetworkStateAsync();
  return !!state.isConnected && !!state.isInternetReachable;
};
