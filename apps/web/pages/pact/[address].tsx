import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader } from "@mantine/core";
import AppHeader from "@/components/layout/switchWallet";
import axio from "@/lib/axios";
import HistoryItem from "@/components/HistoryItem";
export default function PactDetail() {
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { address } = router.query;

    const getPactDetail = async () => {
        const res = await axio.get("/pact", {
            params: {
                address,
            },
        });

        setItem(res);

        setLoading(false);
    };

    useEffect(() => {
        if (!address) {
            return;
        }

        getPactDetail();
    }, [address]);

    return (
        <div className="pb-32">
            <AppHeader />
            <div className="max-w-[50%] mx-auto">
                {loading ? (
                    <div className="text-4xl text-center mt-8">
                        <Loader color="cyan" />;
                    </div>
                ) : (
                    <HistoryItem item={item} address={address} pictureVisible={true} />
                )}
            </div>
        </div>
    );
}
