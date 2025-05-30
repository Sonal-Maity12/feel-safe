cmake_minimum_required(VERSION 3.22.1)
project(feel_safe)

# You can define your native code here if needed
# For now, we'll keep it as a placeholder
add_library(native-lib SHARED
            native-lib.cpp)

find_library(log-lib log) 