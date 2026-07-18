import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Description, Tabs } from "heroui-native";
import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";

export default function AuthScreen() {
  const [tab, setTab] = useState("register");

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-16 pb-8">
            <View className="mt-8 items-center">
              <Text className="text-4xl font-serif-medium">
                {tab === "login" ? "Welcome Back" : "Create Account"}
              </Text>

              <Text className="mt-2 font-normal">Manage your society with ease.</Text>
            </View>

            {/* Tabs */}

            <View className="mt-8 items-center">
              <Tabs value={tab} onValueChange={setTab} variant="primary" className="w-full">
                <Tabs.List className="self-center">
                  <Tabs.Indicator />

                  <Tabs.Trigger value="register">
                    <Tabs.Label>Register</Tabs.Label>
                  </Tabs.Trigger>

                  <Tabs.Trigger value="login">
                    <Tabs.Label>Login</Tabs.Label>
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="register">
                  <RegisterForm />
                </Tabs.Content>

                <Tabs.Content value="login">
                  <LoginForm />
                </Tabs.Content>
              </Tabs>
            </View>

            <Description className="mt-8 text-center text-xs text-muted">
              By continuing you agree to our{" "}
              <Description className="text-primary text-xs font-bold">Terms</Description> and{" "}
              <Description className="text-primary text-xs font-bold">Privacy Policy</Description>.
            </Description>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
