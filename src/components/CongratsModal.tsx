import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    Pressable,
    Animated,
    Share,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { colors, fonts } from "../styles/theme";

interface CongratsModalProps {
    visible: boolean;
    onClose: () => void;
    leagueName?: string;
    inviteCode?: string;
    title?: string;
    subtitle?: string;
}

export function CongratsModal({
    visible,
    onClose,
    leagueName = "your league",
    inviteCode = "ABC123",
    title = "Congrats!",
    subtitle = "You created your fantasy Valorant league!\nNow invite your friends to play against.",
}: CongratsModalProps) {
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [toastAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible, fadeAnim]);

    const inviteLink = `fantasyval://join/${inviteCode}`;
    const inviteMessage = `Join my Fantasy Valorant League "${leagueName}"! Use code: ${inviteCode} or click ${inviteLink}`;

    const handleCopyLink = async () => {
        await Clipboard.setStringAsync(inviteLink);
        setShowCopiedToast(true);

        // Animate toast in
        Animated.sequence([
            Animated.timing(toastAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(1500),
            Animated.timing(toastAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowCopiedToast(false);
        });
    };

    const handleTextInvite = () => {
        const smsUrl = Platform.select({
            ios: `sms:&body=${encodeURIComponent(inviteMessage)}`,
            android: `sms:?body=${encodeURIComponent(inviteMessage)}`,
        });
        if (smsUrl) {
            Linking.openURL(smsUrl);
        }
    };

    const handleEmailInvite = () => {
        const subject = encodeURIComponent(`Join my Fantasy Valorant League: ${leagueName}`);
        const body = encodeURIComponent(inviteMessage);
        Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleMoreOptions = async () => {
        try {
            await Share.share({
                message: inviteMessage,
                title: `Join ${leagueName}`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [
                                {
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                    >
                        {/* Flag Icon */}
                        <View style={styles.flagContainer}>
                            <View style={styles.flagPole} />
                            <View style={styles.flag}>
                                <Text style={styles.flagText}>Go!</Text>
                            </View>
                        </View>

                        {/* Close Button */}
                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </Pressable>

                        {/* Content */}
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>

                        {/* Buttons */}
                        <Pressable style={styles.primaryButton} onPress={handleCopyLink}>
                            <Text style={styles.primaryButtonText}>Copy Invite Link</Text>
                        </Pressable>

                        <Pressable style={styles.secondaryButton} onPress={handleTextInvite}>
                            <Text style={styles.secondaryButtonText}>Text Invite</Text>
                        </Pressable>

                        <Pressable style={styles.secondaryButton} onPress={handleEmailInvite}>
                            <Text style={styles.secondaryButtonText}>Email Invite</Text>
                        </Pressable>

                        <Pressable style={styles.textButton} onPress={handleMoreOptions}>
                            <Text style={styles.textButtonText}>More Sharing Options</Text>
                        </Pressable>
                    </Animated.View>

                    {/* Copied Toast */}
                    {showCopiedToast && (
                        <Animated.View
                            style={[
                                styles.toast,
                                {
                                    opacity: toastAnim,
                                    transform: [
                                        {
                                            translateY: toastAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.toastText}>Invite link copied to clipboard!</Text>
                        </Animated.View>
                    )}
            </Animated.View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "85%",
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        paddingTop: 60,
        alignItems: "center",
    },
    flagContainer: {
        position: "absolute",
        top: -30,
        alignItems: "center",
    },
    flagPole: {
        width: 4,
        height: 80,
        backgroundColor: "#ECE8E1",
        borderRadius: 2,
    },
    flag: {
        position: "absolute",
        top: 8,
        left: 4,
        backgroundColor: "#FFB340",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 2,
        // Flag wave effect
        transform: [{ skewY: "-2deg" }],
    },
    flagText: {
        fontFamily: fonts.valorant,
        fontSize: 24,
        color: "#1a1a1a",
        transform: [{ skewY: "2deg" }],
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontFamily: fonts.valorant,
        fontSize: 28,
        color: colors.text,
        marginBottom: 12,
        marginTop: 16,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    primaryButton: {
        width: "100%",
        backgroundColor: "#5B8DEF",
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0F1923",
    },
    secondaryButton: {
        width: "100%",
        backgroundColor: "transparent",
        paddingVertical: 16,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: "#5B8DEF",
        alignItems: "center",
        marginBottom: 12,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5B8DEF",
    },
    textButton: {
        paddingVertical: 8,
        marginTop: 4,
    },
    textButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#5B8DEF",
    },
    toast: {
        position: "absolute",
        bottom: 100,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    toastText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
    },
})