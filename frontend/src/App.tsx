/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { lazy, Suspense } from "react";
import "@/styles/app.scss";
import { App as AntApp } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import "dayjs/locale/fr";
import Accessibilite from "@utils/Accessibilite/Accessibilite";
import { ApiProvider } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import dayjs from "dayjs";
import BreakPoint from "@utils/Breakpoint/BreakPoint";
import ScrollToTop from "@utils/ScrollTo/ScrollToTop";
import Router from "@routes/AppRouter";
import { AppConfigProvider } from "@/AppConfigProvider";
import { env } from "@/env";
import { queryClient } from "@/queryClient";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
);

dayjs.locale("fr"); // applique la locale globalement (pas uniquement par instance)

function App() {
  const auth = useAuth();

  return (
    <AppConfigProvider>
      <AntApp>
        <Accessibilite />
        <ScrollToTop />
        <ApiProvider baseUrl={env.REACT_APP_API as string} auth={auth} client={queryClient}>
          <div className="full-app">
            <QueryClientProvider client={queryClient}>
              <Router />
              {env.REACT_APP_ENVIRONMENT === "localdev" && (
                <Suspense>
                  <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                </Suspense>
              )}
            </QueryClientProvider>
          </div>
        </ApiProvider>
        {env.REACT_APP_ENVIRONMENT === "localdev" && <BreakPoint />}
      </AntApp>
    </AppConfigProvider>
  );
}

export default App;
