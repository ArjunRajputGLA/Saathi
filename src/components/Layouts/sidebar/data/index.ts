import * as Icons from "../icons";
import { LogoutButton } from "../LogoutButton";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "About Us",
            url: "/",
          },
        ],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Tasks",
        icon: Icons.Checkbox,
        items: [
          {
            title: "List",
            url: "/forms/to-do",
          },
          {
            title: "Kanban",
            url: "/forms/kanban",
          },
        ],
      },
      {
        title: "Notes",
        url: "/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Shared Notes",
            url: "/tables",
          },
        ],
      },
      {
        title: "User Account",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "AI Based Generators",
        icon: Icons.PieChart,
        items: [
          {
            title: "Quiz Generator",
            url: "/AI_Generators/quiz_generator",
          },
          {
            title: "Notes Generator",
            url: "/AI_Generators/notes_generator",
          },
          {
            title: "Roadmap Generator",
            url: "/AI_Generators/roadmap_generator",
          }
        ],
      },
      {
        title: "AI Based Analysis",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Document Analysis",
            url: "/document_analysis",
          }
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/auth/sign-in",
          },
          {
            title: "Sign Up",
            url: "/auth/sign-up",
          },
        ],
      },
      {
        title: "Log Out",
        icon: Icons.Authentication,
        component: LogoutButton,
        items: [],
      },
    ],
  },
];