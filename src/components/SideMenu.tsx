import type { FC, ReactElement } from "react";
import { useState } from "react";
import {
  Button,
  Divider,
  Text,
  Tooltip,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Board24Regular,
  Map24Regular,
  QuestionCircle20Regular,
  Settings24Regular,
  ShieldCheckmark20Regular,
  Sport24Regular,
  PanelLeftContractRegular,
  PanelLeftExpandRegular,
} from "@fluentui/react-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useDashboardStyles } from "../App.styles";

export type SideMenuView =
  | "Vue d’ensemble"
  | "Mes vélos"
  | "Sorties"
  | "Entretiens";

type SideMenuProps = {
  onHelp: () => void;
};

const navigation: { name: SideMenuView; to: string; icon: ReactElement }[] = [
  { name: "Vue d’ensemble", to: "/", icon: <Board24Regular /> },
  { name: "Mes vélos", to: "/garage", icon: <Sport24Regular /> },
  { name: "Sorties", to: "/rides", icon: <Map24Regular /> },
  { name: "Entretiens", to: "/maintenance", icon: <Settings24Regular /> },
];

const SideMenu: FC<SideMenuProps> = ({ onHelp }) => {
  const styles = useDashboardStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={mergeClasses(
        styles.sidebar,
        isCollapsed && styles.sidebarCollapsed,
      )}
    >
      <div
        className={mergeClasses(
          styles.brand,
          isCollapsed && styles.brandCollapsed,
        )}
      >
        <span className={styles.brandIcon}>
          <Sport24Regular />
        </span>
        {!isCollapsed && (
          <Text size={500} weight="bold">
            Bike<span className={styles.brandAccent}>Assist</span>
          </Text>
        )}
        <Tooltip
          content={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
          relationship="label"
        >
          <Button
            className={mergeClasses(
              styles.collapseButton,
              isCollapsed && styles.collapseButtonCollapsed,
            )}
            appearance="transparent"
            icon={
              isCollapsed ? (
                <PanelLeftExpandRegular />
              ) : (
                <PanelLeftContractRegular />
              )
            }
            aria-label={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
            aria-expanded={!isCollapsed}
            aria-controls="side-menu-navigation"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          />
        </Tooltip>
      </div>
      <Divider className={styles.sidebarDivider} />
      {!isCollapsed && (
        <Text className={styles.navCaption}>ESPACE PERSONNEL</Text>
      )}
      <nav
        id="side-menu-navigation"
        aria-label="Navigation principale"
        className={mergeClasses(
          styles.navigation,
          isCollapsed && styles.navigationCollapsed,
        )}
      >
        {navigation.map((item) => {
          const isActive =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <Tooltip key={item.name} content={item.name} relationship="label">
              <Button
                icon={item.icon}
                appearance="subtle"
                className={mergeClasses(
                  styles.navButton,
                  isCollapsed && styles.iconOnlyButton,
                  isActive && styles.active,
                )}
                aria-label={item.name}
                aria-current={isActive ? "page" : undefined}
                onClick={() => navigate(item.to)}
              >
                {!isCollapsed && item.name}
              </Button>
            </Tooltip>
          );
        })}
      </nav>
      <Divider className={styles.helpDivider} />
      <Tooltip content="Centre d’aide" relationship="label">
        <Button
          className={mergeClasses(
            styles.helpNav,
            isCollapsed && styles.iconOnlyButton,
          )}
          appearance="subtle"
          icon={<QuestionCircle20Regular />}
          aria-label="Centre d’aide"
          onClick={onHelp}
        >
          {!isCollapsed && "Centre d’aide"}
        </Button>
      </Tooltip>
      <div className={styles.sidebarFooter}>
        <Tooltip content="Données temporaires" relationship="label">
          <div
            className={mergeClasses(
              styles.privacy,
              isCollapsed && styles.privacyCollapsed,
            )}
          >
            <ShieldCheckmark20Regular />
            {!isCollapsed && (
              <div>
                <Text weight="semibold">Données temporaires</Text>
                <Text className={mergeClasses(styles.muted, styles.small)}>
                  Effacées au rechargement
                </Text>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    </aside>
  );
};

export default SideMenu;
