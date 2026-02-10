import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const primary = Color(0xFF0A8F8F);
  static const primaryLight = Color(0xFF14B8B8);
  static const primaryDark = Color(0xFF067070);
  static const accent = Color(0xFFF5A623);
  static const accentLight = Color(0xFFFFD080);
  static const background = Color(0xFF0B1426);
  static const backgroundLight = Color(0xFF132040);
  static const backgroundCard = Color(0xFF1A2A4A);
  static const surface = Color(0xFF1E3354);
  static const surfaceLight = Color(0xFF264060);
  static const text = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFA0B4CC);
  static const textMuted = Color(0xFF6B7F99);
  static const success = Color(0xFF34C759);
  static const error = Color(0xFFFF3B30);
  static const warning = Color(0xFFFF9F0A);
  static const border = Color(0xFF2A3F5F);
  static const overlay = Color.fromRGBO(0, 0, 0, 0.6);
}

final appTheme = ThemeData(
  useMaterial3: true,
  scaffoldBackgroundColor: AppColors.background,
  colorScheme: ColorScheme.dark(
    primary: AppColors.primary,
    secondary: AppColors.accent,
    surface: AppColors.surface,
    background: AppColors.background,
    error: AppColors.error,
  ),
  textTheme: GoogleFonts.cairoTextTheme().apply(
    bodyColor: AppColors.text,
    displayColor: AppColors.text,
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: AppColors.background,
    elevation: 0,
    centerTitle: true,
  ),
);
