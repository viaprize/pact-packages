import {
  getAccessToken,
  useLogin,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useAppUserStore from "store/app-user";
import { CreateUserDto } from "types/app-user";

export default function useAppUser() {
  const router = useRouter();
  const appUser = useAppUserStore((state) => state.user);
  const refresh = useAppUserStore((state) => state.refreshUser);
  const uploadUser = useAppUserStore((state) => state.uploadUser);
  const clearUser = useAppUserStore((state) => state.clearUser);
  const { wallets } = useWallets();

  const { setActiveWallet } = usePrivyWagmi();

  const { user, logout } = usePrivy();

  const { login } = useLogin({
    async onComplete(user, isNewUser, wasAlreadyAuthenticated) {
      const token = await getAccessToken();
      await refreshUser().catch((error) => {
        console.log({ error }, "errror");
        if (error && error.status) {
          if (error.status === 404) {
            router.push("/onboarding");
          }
        }
      });
      console.log({ token });
      if (wasAlreadyAuthenticated || isNewUser) {
        const walletAddress = user.wallet?.address;
        if (!walletAddress) {
          toast("Wallet address not found, please try again");
          return;
        }
        wallets.forEach((wallet) => {
          setActiveWallet(wallet);
        });
        console.log({ user });
      }

      if (isNewUser && !wasAlreadyAuthenticated) {
        router.push("/onboarding");
      }
    },
    onError(error) {
      toast.error(`Error: ${error} While Logging In `);
    },
  });

  const createNewUser = async (
    userWithoutUserId: Omit<CreateUserDto, "authId">,
  ): Promise<any> => {
    if (!user) {
      throw new Error("User is not logged in");
    }
    return uploadUser({
      ...userWithoutUserId,
      authId: user.id,
    });
  };

  const loginUser = async (): Promise<void> => {
    login();
  };

  const logoutUser = async (): Promise<void> => {
    await logout();
    clearUser();
    router.push("/");
  };

  const refreshUser = async (): Promise<void> => {
    if (user) {
      await refresh(user.id);
    }
  };

  return {
    refreshUser,
    createNewUser,
    logoutUser,
    appUser,
    loginUser,
  };
}
