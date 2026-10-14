import { renderToString } from "react-dom/server";
import { Page } from "@/components/Page";

export const render = () => renderToString(<Page />);
