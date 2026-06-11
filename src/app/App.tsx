import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UnifiedCardsProvider } from "./contexts/UnifiedCardsContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { MetricsProvider } from "./contexts/MetricsContext";
import { LangProvider } from "./contexts/LangContext";

export default function App() {
  return (
    <LangProvider>
      <UserProfileProvider>
        <MetricsProvider>
          <UnifiedCardsProvider>
            <RouterProvider router={router} />
          </UnifiedCardsProvider>
        </MetricsProvider>
      </UserProfileProvider>
    </LangProvider>
  );
}
