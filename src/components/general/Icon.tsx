import type { ComponentProps, ComponentType } from "react";
import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  Fontisto,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from "@expo/vector-icons";

export const iconFamilies = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  Fontisto,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} as const;

export type IconFamily =
  | "AntDesign"
  | "Entypo"
  | "EvilIcons"
  | "Feather"
  | "Fontisto"
  | "FontAwesome"
  | "FontAwesome5"
  | "FontAwesome6"
  | "Foundation"
  | "Ionicons"
  | "MaterialCommunityIcons"
  | "MaterialIcons"
  | "Octicons"
  | "SimpleLineIcons"
  | "Zocial";

export type IconProps<Family extends IconFamily = IconFamily> = {
  family: Family;
} & ComponentProps<(typeof iconFamilies)[Family]>;

export function Icon<Family extends IconFamily>(props: IconProps<Family>) {
  const { family, ...rest } = props;
  const families = iconFamilies as unknown as Record<IconFamily, ComponentType<any>>;
  const IconComponent = families[family as IconFamily];

  return <IconComponent {...rest} />;
}

export default Icon;
