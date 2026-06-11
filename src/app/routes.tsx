import { createBrowserRouter, Outlet, useRouteError } from "react-router";
import { Dashboard }   from "./pages/Dashboard";
import { SOSCalme }    from "./pages/SOSCalme";
import { MyVictories } from "./pages/MyVictories";
import { Routines }    from "./pages/Routines";

function RootError() {
  const e = useRouteError() as { statusText?: string; message?: string };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "var(--font-family)", background: "#FBFBF9" }}>
      <p style={{ fontSize: 13, color: "#7A8A84" }}>{e?.statusText ?? e?.message ?? "Something went wrong."}</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RootError />,
    Component: () => <Outlet />,
    children: [
      { index: true,        Component: Dashboard },
      { path: "sos",        Component: SOSCalme },
      { path: "victories",  Component: MyVictories },
      { path: "routines",   Component: Routines },
      { path: "*",          Component: Dashboard },
    ],
  },
]);
