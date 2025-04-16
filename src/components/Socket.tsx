"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useUser } from "@clerk/nextjs";

export default function Socket() {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    const { user } = useUser();

    useEffect(() => {
        if (!user) return; // Skip if no user is authenticated

        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            try {
                setIsConnected(true);
                setTransport(socket.io.engine.transport.name);

                socket.io.engine.on("upgrade", (transport) => {
                    setTransport(transport.name);
                });
                if (user?.username) {
                    socket.emit("newUser", user.username);
                }
            } catch (error) {
                console.error("Socket connection error:", error);
            }
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        try {
            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);

            return () => {
                socket.off("connect", onConnect);
                socket.off("disconnect", onDisconnect);
            };
        } catch (error) {
            console.error("Socket event binding error:", error);
            return () => { };
        }
    }, [user]);

    return (
        <></>
    );
}