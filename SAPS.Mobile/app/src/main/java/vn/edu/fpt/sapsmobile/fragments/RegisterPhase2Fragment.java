package vn.edu.fpt.sapsmobile.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.auth.RegisterActivity;

public class RegisterPhase2Fragment extends Fragment {

    private EditText fullNameInput, idNumberInput, dobInput, sexInput, nationalityInput, placeOriginInput, placeResidenceInput;
    private EditText issueDateInput, issuePlaceInput;
    private Button nextButton;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register_phase2, container, false);

        fullNameInput = view.findViewById(R.id.input_full_name);
        idNumberInput = view.findViewById(R.id.input_id_number);
        dobInput = view.findViewById(R.id.input_dob);
        sexInput = view.findViewById(R.id.input_sex);
        nationalityInput = view.findViewById(R.id.input_nationality);
        placeOriginInput = view.findViewById(R.id.input_place_origin);
        placeResidenceInput = view.findViewById(R.id.input_place_residence);
        issueDateInput = view.findViewById(R.id.input_issue_date);
        issuePlaceInput = view.findViewById(R.id.input_issue_place);
        nextButton = view.findViewById(R.id.button_next_phase);

        // Auto-fill data từ Phase 1
        RegisterActivity activity = (RegisterActivity) requireActivity();
        fullNameInput.setText(activity.registerData.getFullName());
        idNumberInput.setText(activity.registerData.getIdNumber());
        dobInput.setText(activity.registerData.getDateOfBirth());
        sexInput.setText(activity.registerData.getSex());
        nationalityInput.setText(activity.registerData.getNationality());
        placeOriginInput.setText(activity.registerData.getPlaceOfOrigin());
        placeResidenceInput.setText(activity.registerData.getPlaceOfResidence());
        issueDateInput.setText(activity.registerData.getIssueDate());
        issuePlaceInput.setText(activity.registerData.getIssuePlace());

        // Disable auto-filled fields
        fullNameInput.setEnabled(false);
        idNumberInput.setEnabled(false);
        dobInput.setEnabled(false);
        sexInput.setEnabled(false);
        nationalityInput.setEnabled(false);
        placeOriginInput.setEnabled(false);
        placeResidenceInput.setEnabled(false);
        issueDateInput.setEnabled(false);
        issuePlaceInput.setEnabled(false);

        nextButton.setOnClickListener(v -> {
            activity.nextPhase();
        });

        return view;
    }
}