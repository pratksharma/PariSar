import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Tabs, Typography } from "heroui-native";
import Lucide from "@react-native-vector-icons/lucide";

import GuardLoginForm from "@/components/auth/GuardLoginForm";
import GuardRegisterForm from "@/components/auth/GuardRegisterForm";

export default function GuardPortalScreen() {
  const [tab, setTab] = useState("login");

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-16 pb-8">
            <View className="mt-8 items-center gap-2">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <Lucide name="shield-check" size={30} color="white" />
              </View>

              <Typography.Heading className="text-3xl font-serif-medium text-center">
                Guard Security Portal
              </Typography.Heading>

              <Typography.Paragraph className="text-center font-normal" color="muted">
                {tab === "login"
                  ? "Sign in to access your security guard account."
                  : "Register your guard account with your Joining Code."}
              </Typography.Paragraph>
            </View>

            {/* Guard Portal Tabs */}
            <View className="mt-8 items-center">
              <Tabs value={tab} onValueChange={setTab} variant="primary" className="w-full">
                <Tabs.List className="self-center">
                  <Tabs.Indicator />

                  <Tabs.Trigger value="login">
                    <Tabs.Label>Guard Login</Tabs.Label>
                  </Tabs.Trigger>

                  <Tabs.Trigger value="register">
                    <Tabs.Label>Guard Register</Tabs.Label>
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="login">
                  <GuardLoginForm />
                </Tabs.Content>

                <Tabs.Content value="register">
                  <GuardRegisterForm />
                </Tabs.Content>
              </Tabs>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
