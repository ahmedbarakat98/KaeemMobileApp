import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";

type CollapsibleProps = PropsWithChildren<{
  title: string;
}>;

export function Collapsible({ children, title }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
        ]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <View style={styles.button}>
          <ChevronRight
            size={16}
            color="#0f172a"
            style={{
              transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
            }}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
      </Pressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  content: {
    marginTop: 10,
    marginLeft: 36,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
});