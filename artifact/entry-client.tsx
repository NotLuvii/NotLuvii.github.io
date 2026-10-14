import { hydrateRoot } from "react-dom/client";
import { Page } from "@/components/Page";

hydrateRoot(document.getElementById("root")!, <Page />);
